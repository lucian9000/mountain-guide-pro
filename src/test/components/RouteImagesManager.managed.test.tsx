import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RouteImagesManager from "@/components/admin/RouteImagesManager";
import type { RouteImage } from "@/lib/types/content";
const patch = vi.hoisted(() => vi.fn());
vi.mock("@/lib/queries/contentAdmin", () => ({ useAddRouteImage: () => ({}), useDeleteRouteImage: () => ({}), useUpdateRouteImages: () => ({ mutateAsync: patch, isPending: false }) }));
vi.mock("@/lib/images", () => ({ publicImageUrl: (path: string) => path, uploadRouteImage: vi.fn() }));
const images = [{ id: "b", sort_order: 20, alt_text: "Second" }, { id: "a", sort_order: 10, alt_text: "First" }] as RouteImage[];
beforeEach(() => { patch.mockReset(); patch.mockResolvedValue(undefined); });
it("offers bounded accessible controls and saves the same ordering as dragging", async () => {
  render(<RouteImagesManager routeId="r" slug="r" images={images} />);
  expect(screen.getByRole("button", { name: "Move image 1 earlier" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "Move image 2 later" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Move image 1 later" }));
  await waitFor(() => expect(patch).toHaveBeenCalledWith([{ id: "b", sort_order: 10 }, { id: "a", sort_order: 20 }]));
  expect(screen.getAllByRole("listitem")[0]).toHaveAttribute("draggable", "true");
});
it("catches a failed reorder and displays the partial-save warning", async () => {
  patch.mockRejectedValue(new Error("Network failed"));
  render(<RouteImagesManager routeId="r" slug="r" images={images} />);
  fireEvent.click(screen.getByRole("button", { name: "Move image 2 earlier" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Network failed");
});
