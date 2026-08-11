import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ImageUpload from "@/components/admin/ImageUpload";
import { BucketMissingError } from "@/lib/image-compress";

const uploadImage = vi.hoisted(() => vi.fn());
const toast = vi.hoisted(() => vi.fn());

vi.mock("@/lib/image-compress", async () => {
  const actual = await vi.importActual<typeof import("@/lib/image-compress")>(
    "@/lib/image-compress"
  );
  return { ...actual, uploadImage };
});
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast }) }));

// jsdom has no object-URL support.
beforeEach(() => {
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
  uploadImage.mockReset();
  toast.mockReset();
});

const imageFile = (name = "photo.jpg", type = "image/jpeg", size = 1000) => {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

const pickFile = (file: File) => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
};

describe("ImageUpload", () => {
  it("shows a drop zone and the paste-a-URL fallback when empty", () => {
    render(<ImageUpload bucket="event-images" value={null} onChange={vi.fn()} />);
    expect(screen.getByText(/drag & drop or click to upload|tap to add a photo/i)).toBeInTheDocument();
    expect(screen.getByText(/paste an image url instead/i)).toBeInTheDocument();
  });

  it("offers a camera-capable file input for phone use", () => {
    render(<ImageUpload bucket="event-images" value={null} onChange={vi.fn()} />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute("accept", "image/*");
    expect(input).toHaveAttribute("capture", "environment");
  });

  it("rejects a file over 5MB without uploading", async () => {
    const onChange = vi.fn();
    render(<ImageUpload bucket="event-images" value={null} onChange={onChange} />);
    pickFile(imageFile("big.jpg", "image/jpeg", 6 * 1024 * 1024));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/under 5MB/i) })
      )
    );
    expect(uploadImage).not.toHaveBeenCalled();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("rejects a non-image file", async () => {
    render(<ImageUpload bucket="event-images" value={null} onChange={vi.fn()} />);
    pickFile(imageFile("notes.pdf", "application/pdf"));
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/isn't an image/i) })
      )
    );
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("uploads a valid file and reports the public URL", async () => {
    uploadImage.mockResolvedValue("https://cdn.example.com/abc.webp");
    const onChange = vi.fn();
    render(<ImageUpload bucket="event-images" value={null} onChange={onChange} />);
    pickFile(imageFile());
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith("https://cdn.example.com/abc.webp")
    );
    expect(uploadImage).toHaveBeenCalledWith("event-images", expect.any(File));
  });

  it("keeps the selection and offers Retry when the upload fails", async () => {
    uploadImage.mockRejectedValue(new Error("network"));
    render(<ImageUpload bucket="event-images" value={null} onChange={vi.fn()} />);
    pickFile(imageFile());
    expect(await screen.findByRole("button", { name: /retry upload/i })).toBeInTheDocument();
    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringMatching(/upload failed/i) })
    );
  });

  it("falls back to the URL box when the bucket doesn't exist yet", async () => {
    uploadImage.mockRejectedValue(new BucketMissingError("event-images"));
    render(<ImageUpload bucket="event-images" value={null} onChange={vi.fn()} />);
    pickFile(imageFile());
    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.stringMatching(/isn't set up yet/i) })
      )
    );
    expect(await screen.findByLabelText(/image url/i)).toBeInTheDocument();
  });

  it("accepts a pasted URL without uploading", () => {
    const onChange = vi.fn();
    render(<ImageUpload bucket="event-images" value={null} onChange={onChange} />);
    fireEvent.click(screen.getByText(/paste an image url instead/i));
    fireEvent.change(screen.getByLabelText(/image url/i), {
      target: { value: "https://example.com/x.jpg" },
    });
    fireEvent.click(screen.getByRole("button", { name: /use/i }));
    expect(onChange).toHaveBeenCalledWith("https://example.com/x.jpg");
    expect(uploadImage).not.toHaveBeenCalled();
  });

  it("previews an existing value and can remove it", () => {
    const onChange = vi.fn();
    render(
      <ImageUpload
        bucket="guide-photos"
        value="https://cdn.example.com/guide.webp"
        onChange={onChange}
        aspectRatio="1/1"
      />
    );
    const img = document.querySelector("img") as HTMLImageElement;
    expect(img).toHaveAttribute("src", "https://cdn.example.com/guide.webp");
    expect(screen.getByRole("button", { name: /change photo/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /remove photo/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
