import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";

// Simple test data
interface TestData {
  id: string;
  name: string;
  status: string;
}

const testData: TestData[] = [
  { id: "1", name: "Item 1", status: "active" },
  { id: "2", name: "Item 2", status: "closed" },
  { id: "3", name: "Item 3", status: "active" },
];

const testColumns: ColumnDef<TestData, unknown>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

describe("DataTable", () => {
  it("renders table with columns and data", () => {
    render(<DataTable columns={testColumns} data={testData} />);

    // Check headers
    expect(screen.getByText("ID")).toBeDefined();
    expect(screen.getByText("Name")).toBeDefined();
    expect(screen.getByText("Status")).toBeDefined();

    // Check data cells
    expect(screen.getByText("Item 1")).toBeDefined();
    expect(screen.getByText("Item 2")).toBeDefined();
    expect(screen.getByText("active")).toBeDefined();
  });

  it("shows empty message when no data", () => {
    render(
      <DataTable
        columns={testColumns}
        data={[]}
        emptyMessage="No items found"
      />
    );

    expect(screen.getByText("No items found")).toBeDefined();
  });

  it("shows loading state", () => {
    render(<DataTable columns={testColumns} data={[]} isLoading={true} />);

    // Should show loading spinner (animated div with specific classes)
    const loadingSpinner = document.querySelector(".animate-spin");
    expect(loadingSpinner).not.toBeNull();
  });

  it("renders expandable rows when renderSubComponent is provided", () => {
    const renderSubComponent = vi.fn(({ row }) => (
      <div data-testid="expanded-content">Expanded: {row.original.name}</div>
    ));

    render(
      <DataTable
        columns={testColumns}
        data={testData}
        renderSubComponent={renderSubComponent}
        getRowId={(row) => row.id}
      />
    );

    // Should have expand buttons
    const expandButtons = screen.getAllByRole("button", { name: /expand row/i });
    expect(expandButtons.length).toBe(3);
  });

  it("toggles row expansion on click", () => {
    const renderSubComponent = ({ row }: { row: { original: TestData } }) => (
      <div data-testid="expanded-content">Expanded: {row.original.name}</div>
    );

    render(
      <DataTable
        columns={testColumns}
        data={testData}
        renderSubComponent={renderSubComponent}
        getRowId={(row) => row.id}
      />
    );

    // Initially, no expanded content
    expect(screen.queryByTestId("expanded-content")).toBeNull();

    // Click expand button for first row
    const expandButtons = screen.getAllByRole("button", { name: /expand row/i });
    fireEvent.click(expandButtons[0]);

    // Now should see expanded content
    expect(screen.getByTestId("expanded-content")).toBeDefined();
    expect(screen.getByText("Expanded: Item 1")).toBeDefined();
  });

  it("shows pagination controls with data", () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enablePagination={true}
        initialPageSize={2}
      />
    );

    // Should show pagination info
    expect(screen.getByText(/Showing/)).toBeDefined();
    expect(screen.getByText("Previous")).toBeDefined();
    expect(screen.getByText("Next")).toBeDefined();
  });

  it("hides pagination when disabled", () => {
    render(
      <DataTable
        columns={testColumns}
        data={testData}
        enablePagination={false}
      />
    );

    // Should not show pagination buttons
    expect(screen.queryByText("Previous")).toBeNull();
    expect(screen.queryByText("Next")).toBeNull();
  });

  it("calls onRowClick when row is clicked", () => {
    const onRowClick = vi.fn();

    render(
      <DataTable
        columns={testColumns}
        data={testData}
        onRowClick={onRowClick}
        renderSubComponent={() => <div>Expanded</div>}
        getRowId={(row) => row.id}
      />
    );

    // Click on a row (not the button)
    const rows = document.querySelectorAll("tbody tr");
    fireEvent.click(rows[0]);

    expect(onRowClick).toHaveBeenCalled();
    expect(onRowClick.mock.calls[0][0].original).toEqual(testData[0]);
  });
});
