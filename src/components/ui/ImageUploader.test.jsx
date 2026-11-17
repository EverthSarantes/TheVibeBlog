import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ImageUploader from "./ImageUploader";

describe("ImageUploader", () => {
  it("renders upload button when no value", () => {
    render(<ImageUploader value="" onChange={vi.fn()} />);
    expect(screen.getByText("Subir imagen")).toBeInTheDocument();
  });

  it("renders library button when allowLibrary is true", () => {
    render(<ImageUploader value="" onChange={vi.fn()} allowLibrary={true} />);
    expect(screen.getByText("Elegir de biblioteca")).toBeInTheDocument();
  });

  it("hides library button when allowLibrary is false", () => {
    render(<ImageUploader value="" onChange={vi.fn()} allowLibrary={false} />);
    expect(screen.queryByText("Elegir de biblioteca")).not.toBeInTheDocument();
  });

  it("shows preview when value is provided", () => {
    render(<ImageUploader value="data:image/png;base64,abc" onChange={vi.fn()} />);
    expect(screen.getByAltText("Cover")).toBeInTheDocument();
  });
});