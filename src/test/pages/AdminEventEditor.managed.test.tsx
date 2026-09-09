import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import AdminEventEditor from "@/pages/admin/AdminEventEditor";
const state = vi.hoisted(() => ({ source: null as unknown, guides: [{ id: "ernest", display_name: "Ernest", active: true }, { id: "other", display_name: "Other", active: true }] }));
vi.mock("@/lib/queries/events", () => ({ useAdminEvent: () => ({ data: state.source }), useCreateEvent: () => ({}), useUpdateEvent: () => ({}) }));
vi.mock("@/lib/queries/admin", () => ({ useGuides: () => ({ data: state.guides }) }));
vi.mock("@/components/admin/ShareEventDialog", () => ({ default: () => null }));
vi.mock("@/components/admin/EventPreviewCard", () => ({ default: () => null }));
vi.mock("@/components/admin/ImageUpload", () => ({ default: () => null }));
// Native select keeps this test focused on editor state, independent of Radix pointer APIs.
vi.mock("@/components/ui/select", () => ({
  Select: ({ value, onValueChange, children }: { value: string; onValueChange: (v: string) => void; children: React.ReactNode }) => <select aria-label="Guide" value={value} onChange={(e) => onValueChange(e.target.value)}>{children}</select>,
  SelectTrigger: () => null, SelectValue: () => null,
  SelectContent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  SelectItem: ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>,
}));
const draw = (path = "/admin/events/new") => render(<MemoryRouter initialEntries={[path]}><Routes><Route path="/admin/events/new" element={<AdminEventEditor />} /><Route path="/admin/events/:id" element={<AdminEventEditor />} /></Routes></MemoryRouter>);
const guideStep = () => {
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Test hike" } });
  fireEvent.change(screen.getByLabelText("Date"), { target: { value: "2027-01-01" } });
  fireEvent.click(screen.getByRole("button", { name: /Next/ }));
  fireEvent.click(screen.getByRole("button", { name: /Next/ }));
};
beforeEach(() => { state.source = null; });
it("defaults Ernest once and preserves an explicitly cleared selection", () => {
  draw(); guideStep();
  expect(screen.getByRole("combobox")).toHaveValue("ernest");
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "none" } });
  expect(screen.getByRole("combobox")).toHaveValue("none");
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Changed" } });
  expect(screen.getByRole("combobox")).toHaveValue("none");
});
it.each([["/admin/events/event-id", "other"], ["/admin/events/new?duplicate=event-id", null]])("preserves source selection for %s", (path, guideId) => {
  state.source = { title: "Existing", event_date: "2027-01-01", capacity: 10, price_per_person: 100, guide_id: guideId };
  draw(path); guideStep();
  expect(screen.getByRole("combobox")).toHaveValue(guideId ?? "none");
});
