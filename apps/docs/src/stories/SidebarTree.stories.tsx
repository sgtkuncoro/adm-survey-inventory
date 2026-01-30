import type { Meta, StoryObj } from "@storybook/react";
import { 
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarInset,
  SidebarTrigger,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent
} from "@packages/ui";
import { 
  ChevronRight, 
  Map, 
  Settings, 
  LifeBuoy, 
  Send 
} from "lucide-react";

const meta = {
  title: "Components/Sidebar/Tree",
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

function SidebarTree() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-4">
             <div className="h-8 w-8 rounded-lg bg-blue-600"></div>
             <span className="font-semibold">Tree Example</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {/* Collapsible Tree Item */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Documentation">
                      <Map />
                      <span>Documentation</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                       <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                          <span>Introduction</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                          <span>Get Started</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                          <span>Tutorials</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                          <span>Changelog</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Another Collapsible Item */}
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip="Settings">
                      <Settings />
                      <span>Settings</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                       <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                          <span>General</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                          <span>Team</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                          <span>Billing</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                          <span>Limits</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
              
               <SidebarMenuItem>
                <SidebarMenuButton>
                  <LifeBuoy />
                  <span>Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
               <SidebarMenuItem>
                <SidebarMenuButton>
                  <Send />
                  <span>Feedback</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
          <div className="p-4">
              <SidebarTrigger />
              <div className="mt-4 border border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  Content Area
              </div>
          </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export const Default: Story = {
  render: () => <SidebarTree />,
};
