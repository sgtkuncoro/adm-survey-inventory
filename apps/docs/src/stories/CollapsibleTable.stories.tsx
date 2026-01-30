import type { Meta, StoryObj } from "@storybook/react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  Badge,
  Button
} from "@packages/ui";
import { ChevronRight } from "lucide-react";
import React, { useState } from "react";

const meta = {
  title: "UI/CollapsibleTable",
  component: Table, 
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof Table>;

const CollapsibleRow = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
      <React.Fragment>
        <TableRow className="cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <TableCell>
            <Badge variant="info" className="bg-purple-100 text-purple-700">Morning Consult</Badge>
          </TableCell>
          <TableCell className="font-mono text-xs">9c094c11...de80</TableCell>
          <TableCell>General</TableCell>
          <TableCell className="text-green-600 font-medium">$1.05 - $4.00</TableCell>
          <TableCell>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`} />
              </Button>
            </CollapsibleTrigger>
          </TableCell>
        </TableRow>
        <CollapsibleContent asChild>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableCell colSpan={5} className="p-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">Quota Breakdown</h4>
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Quota ID</TableHead>
                         <TableHead>Gender</TableHead>
                         <TableHead>Age</TableHead>
                         <TableHead>CPI</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      <TableRow>
                        <TableCell className="font-mono text-xs text-gray-500">quota-1</TableCell>
                        <TableCell><Badge variant="secondary" className="bg-blue-100 text-blue-700">Male</Badge></TableCell>
                        <TableCell>18-34</TableCell>
                        <TableCell className="text-green-600 font-medium">$3.50</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs text-gray-500">quota-2</TableCell>
                        <TableCell><Badge variant="secondary" className="bg-pink-100 text-pink-700">Female</Badge></TableCell>
                        <TableCell>18-34</TableCell>
                        <TableCell className="text-green-600 font-medium">$4.00</TableCell>
                      </TableRow>
                   </TableBody>
                </Table>
              </div>
            </TableCell>
          </TableRow>
        </CollapsibleContent>
      </React.Fragment>
    </Collapsible>
  );
};

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Provider</TableHead>
          <TableHead>Survey ID</TableHead>
          <TableHead>Topic</TableHead>
          <TableHead>CPI Range</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <CollapsibleRow />
        <CollapsibleRow />
        <CollapsibleRow />
      </TableBody>
    </Table>
  ),
};
