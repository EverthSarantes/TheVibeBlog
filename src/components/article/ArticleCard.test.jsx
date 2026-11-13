import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ArticleCard from "./ArticleCard";

describe("ArticleCard", () => {
  const article = {
    id: "1",
    title: "Test Article",
    subtitle: "A subtitle",
    content: "<p>Hello world test content here</p>",
    slug: "test-article",
    coverImage: "https://example.com/img.jpg",
    tags: ["react", "test"],
    authorName: "John Doe",
    claps: 5,
    publishedAt: new Date().toISOString(),
  };

  it("renders title and subtitle", () => {
    render(<MemoryRouter><ArticleCard article={article} /></MemoryRouter>);
    expect(screen.getByText("Test Article")).toBeInTheDocument();
    expect(screen.getByText("A subtitle")).toBeInTheDocument();
  });

  it("renders tags", () => {
    render(<MemoryRouter><ArticleCard article={article} /></MemoryRouter>);
    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("test")).toBeInTheDocument();
  });

  it("renders author name", () => {
    render(<MemoryRouter><ArticleCard article={article} /></MemoryRouter>);
    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });
});