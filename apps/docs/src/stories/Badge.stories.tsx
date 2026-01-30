import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "@packages/ui";

const meta = {
  title: "UI/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "secondary", "destructive", "outline", "success", "warning", "info"],
    },
    children: { control: "text" },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
    variant: "default",
  },
};

export const Success: Story = {
  args: {
    children: "Open",
    variant: "success",
  },
};

export const Warning: Story = {
  args: {
    children: "Closed",
    variant: "warning",
  },
};
