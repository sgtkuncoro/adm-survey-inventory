import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { 
  Badge, 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  Input, 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell,
  Progress,
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarSeparator,
  Separator,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext
} from "@packages/ui";
import { 
  Search, 
  RotateCw, 
  ChevronRight, 
  Activity, 
  Home, 
  Target,
  Users, 
  CreditCard, 
  LayoutDashboard,
  Plug,
  FileText
} from "lucide-react";

const meta = {
  title: "Pages/Dashboard",
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// App Sidebar Component
function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 p-2">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-600 text-white font-bold">
             SA
           </div>
           <div className="flex flex-col gap-0.5 leading-none">
             <span className="font-semibold">ShopperArmy</span>
             <span className="text-xs text-muted-foreground">Admin Dashboard</span>
           </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Home />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Target />
                  <span>Missions</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>
                  <LayoutDashboard />
                  <span>Survey Inventory</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users />
                  <span>Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <CreditCard />
                  <span>Payouts</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Integrations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
               <SidebarMenuItem>
                <SidebarMenuButton>
                  <Plug />
                  <span>API Providers</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText />
                  <span>Qualification Legend</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

export const SurveyInventory: Story = {
  render: () => {
    const [expandedRow, setExpandedRow] = React.useState<number | null>(null);

    const toggleRow = (id: number) => {
      setExpandedRow(expandedRow === id ? null : id);
    };

    const surveys = [
        { id: 1, provider: "Morning Consult", sid: "9c094c11...de80", topic: "General", length: "24.6 min", cpi: "$1.05 - $4.00", quotas: "16 quotas", progress: 4.1, status: "Open", date: "Jan 25" },
        { id: 2, provider: "Morning Consult", sid: "472e9f09...f559", topic: "General", length: "23.4 min", cpi: "$2.96 - $4.00", quotas: "16 quotas", progress: 3.8, status: "Open", date: "Jan 25" },
        { id: 3, provider: "Morning Consult", sid: "d8e4cb6d...3f28", topic: "General", length: "26.8 min", cpi: "$4.00", quotas: "16 quotas", progress: 3.9, status: "Open", date: "Jan 25" },
        { id: 4, provider: "Morning Consult", sid: "abc12345...6789", topic: "Finance", length: "18.2 min", cpi: "$3.50", quotas: "8 quotas", progress: 100, status: "Closed", date: "Dec 28", closed: true },
    ];

    return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex flex-1 flex-col gap-4 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="-ml-2" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Survey Inventory</h1>
                        <p className="text-gray-500 mt-1">External survey opportunities from API providers</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    Last synced: 12 mins ago
                </div>
                <Button variant="outline" className="gap-2">
                    <RotateCw className="h-4 w-4" />
                    Sync Now
                </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-4">
                <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Activity className="h-5 w-5" />
                    </div>
                    <Badge variant="success" className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold">+3 new</Badge>
                    </div>
                    <div className="text-3xl font-bold">20</div>
                    <span className="text-sm text-muted-foreground">Active Surveys</span>
                </CardContent>
                </Card>
                <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                        <Target className="h-5 w-5" />
                    </div>
                    </div>
                    <div className="text-3xl font-bold">$3.73</div>
                    <span className="text-sm text-muted-foreground">Avg CPI</span>
                </CardContent>
                </Card>
                <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-pink-50 rounded-lg text-pink-600">
                        <Users className="h-5 w-5" />
                    </div>
                    </div>
                    <div className="text-3xl font-bold">78,796</div>
                    <span className="text-sm text-muted-foreground">Total Slots Available</span>
                </CardContent>
                </Card>
                <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                        <RotateCw className="h-5 w-5" />
                    </div>
                    </div>
                    <div className="text-3xl font-bold">25 min</div>
                    <span className="text-sm text-muted-foreground">Avg Survey Length</span>
                </CardContent>
                </Card>
            </div>

            {/* Filters & Table */}
            <Card>
                <CardHeader className="border-b border-gray-100 bg-white p-4">
                <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                    <select className="h-9 w-[140px] px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-primary focus:border-transparent">
                        <option>All Providers</option>
                    </select>
                    <select className="h-9 w-[120px] px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-primary focus:border-transparent">
                        <option>All Status</option>
                    </select>
                     <select className="h-9 w-[120px] px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-primary focus:border-transparent">
                        <option>Any CPI</option>
                    </select>
                     <select className="h-9 w-[140px] px-3 py-1 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-primary focus:border-transparent">
                        <option>Any Length</option>
                    </select>
                    </div>
                    <div className="relative w-64">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search by ID or topic..." className="pl-9 h-9 bg-gray-50 border-gray-200" />
                    </div>
                </div>
                </CardHeader>
                <CardContent className="p-0">
                <Table>
                    <TableHeader className="[&_tr]:border-b-gray-100">
                    <TableRow className="hover:bg-transparent">
                        <TableHead>Provider</TableHead>
                        <TableHead>Survey ID</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Length</TableHead>
                        <TableHead>CPI Range</TableHead>
                        <TableHead>Quotas</TableHead>
                        <TableHead>Fill Progress</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead></TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody className="[&_tr]:border-b-gray-50">
                    {surveys.map((survey) => (
                        <React.Fragment key={survey.id}>
                            <TableRow 
                                className={`cursor-pointer ${survey.closed ? "opacity-60" : ""}`}
                                onClick={() => toggleRow(survey.id)}
                            >
                                <TableCell>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                                        {survey.provider}
                                    </span>
                                </TableCell>
                                <TableCell className="font-mono text-sm text-gray-600">{survey.sid}</TableCell>
                                <TableCell className="font-medium text-gray-900">{survey.topic}</TableCell>
                                <TableCell className="text-gray-700">{survey.length}</TableCell>
                                <TableCell className={`font-bold ${survey.closed ? "text-gray-500" : "text-green-600"}`}>{survey.cpi}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{survey.quotas}</span>
                                </TableCell>
                                <TableCell className="w-[180px]">
                                    <div className="flex items-center gap-3">
                                    <Progress value={survey.progress} className={`h-1.5 ${survey.closed ? "bg-gray-400" : "bg-gray-100"}`} indicatorClassName={survey.closed ? "bg-gray-500" : "bg-green-500"} />
                                    <span className="text-xs text-gray-500 w-8">{survey.progress}%</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${survey.closed ? "bg-gray-200 text-gray-600" : "bg-green-100 text-green-700"}`}>{survey.status}</span>
                                </TableCell>
                                <TableCell className="text-sm text-gray-500">{survey.date}</TableCell>
                                <TableCell>
                                    <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${expandedRow === survey.id ? "rotate-90" : ""}`} />
                                </TableCell>
                            </TableRow>
                            {expandedRow === survey.id && (
                                <TableRow className="bg-gray-50 hover:bg-gray-50">
                                    <TableCell colSpan={10} className="p-6">
                                        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                            <h4 className="font-bold text-gray-900 mb-4">Quota Breakdown</h4>
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader className="[&_tr]:border-b-gray-100">
                                                        <TableRow className="hover:bg-transparent">
                                                            <TableHead className="py-2 px-3 text-xs font-semibold text-gray-500">Quota ID</TableHead>
                                                            <TableHead className="py-2 px-3 text-xs font-semibold text-gray-500">Gender</TableHead>
                                                            <TableHead className="py-2 px-3 text-xs font-semibold text-gray-500">Age Range</TableHead>
                                                            <TableHead className="py-2 px-3 text-xs font-semibold text-gray-500">Language</TableHead>
                                                            <TableHead className="py-2 px-3 text-xs font-semibold text-gray-500">CPI</TableHead>
                                                            <TableHead className="py-2 px-3 text-xs font-semibold text-gray-500">Needed</TableHead>
                                                            <TableHead className="py-2 px-3 text-xs font-semibold text-gray-500">Filled</TableHead>
                                                            <TableHead className="py-2 px-3 text-xs font-semibold text-gray-500">Status</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody className="[&_tr]:border-b-gray-50">
                                                        <TableRow className="border-b border-gray-50 hover:bg-transparent">
                                                            <TableCell className="py-2 px-3 font-mono text-xs text-gray-500">quota-1</TableCell>
                                                            <TableCell className="py-2 px-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Male</span></TableCell>
                                                            <TableCell className="py-2 px-3 text-gray-700 text-xs">18-34</TableCell>
                                                            <TableCell className="py-2 px-3 text-gray-700 text-xs">English only</TableCell>
                                                            <TableCell className="py-2 px-3 text-green-600 font-semibold text-xs">$3.50</TableCell>
                                                            <TableCell className="py-2 px-3 text-gray-700 text-xs">250</TableCell>
                                                            <TableCell className="py-2 px-3 text-gray-700 text-xs">12</TableCell>
                                                            <TableCell className="py-2 px-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Open</span></TableCell>
                                                        </TableRow>
                                                        <TableRow className="border-b border-gray-50 hover:bg-transparent">
                                                            <TableCell className="py-2 px-3 font-mono text-xs text-gray-500">quota-2</TableCell>
                                                            <TableCell className="py-2 px-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700">Female</span></TableCell>
                                                            <TableCell className="py-2 px-3 text-gray-700 text-xs">18-34</TableCell>
                                                            <TableCell className="py-2 px-3 text-gray-700 text-xs">Bilingual</TableCell>
                                                            <TableCell className="py-2 px-3 text-green-600 font-semibold text-xs">$4.00</TableCell>
                                                            <TableCell className="py-2 px-3 text-gray-700 text-xs">250</TableCell>
                                                            <TableCell className="py-2 px-3 text-gray-700 text-xs">8</TableCell>
                                                            <TableCell className="py-2 px-3"><span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Open</span></TableCell>
                                                        </TableRow>
                                                        <TableRow className="hover:bg-transparent">
                                                            <TableCell colSpan={8} className="py-2 px-3 text-center text-gray-500 text-xs italic">
                                                            + 11 more quotas...
                                                            </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                    </TableBody>
                </Table>
                
                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-900">1-6</span> of <span className="font-medium text-gray-900">20</span> surveys
                    </div>
                     <Pagination className="w-auto mx-0">
                        <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious href="#" disabled size="sm" />
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" isActive size="sm">1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" size="sm">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationLink href="#" size="sm">3</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext href="#" size="sm" />
                        </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
                </CardContent>
            </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
    );
  },
};
