"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useAdminProvider,
  useUpdateProvider,
  useGenerateKey,
  useRegisterKey,
  useSetRedirects,
} from "@/hooks/use-admin";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Switch,
  Separator,
} from "@packages/ui";
import {
  Loader2,
  ArrowLeft,
  Save,
  Key,
  Globe,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner"; // Assuming sonner is installed or available, otherwise use alert

export default function ProviderEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: provider, isLoading, error } = useAdminProvider(id);
  const { mutate: updateProvider, isPending: isUpdating } = useUpdateProvider();
  const { mutate: generateKey, isPending: isGenerating } = useGenerateKey();
  const { mutate: registerKey, isPending: isRegistering } = useRegisterKey();
  const { mutate: setRedirects, isPending: isSettingRedirects } =
    useSetRedirects();

  // Local state for form fields
  const [formData, setFormData] = useState<any>({});

  // Sync local state with fetched data
  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name,
        slug: provider.slug,
        isActive: provider.isActive,
        apiBaseUrl: provider.apiBaseUrl || "",
        credentials: provider.credentials || "",
        supplierId: provider.supplierId || "",
        prescreenerUrl: provider.prescreenerUrl || "",
        minCpiCents: provider.minCpiCents || 0,
        userPayoutPct: provider.userPayoutPct || 0,
        eligibilityCacheTtl: provider.eligibilityCacheTtl || 0,
      });
    }
  }, [provider]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) : value,
    }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev: any) => ({ ...prev, isActive: checked }));
  };

  const handleSave = () => {
    updateProvider(
      { id, updates: formData },
      {
        onSuccess: () => {
          // alert("Saved successfully");
        },
        onError: (err) => {
          alert("Failed to save: " + err.message);
        },
      },
    );
  };

  const handleGenerateKey = () => {
    if (confirm("Are you sure? This will invalidate the previous key.")) {
      generateKey(id, {
        onSuccess: (data: any) => {
          alert("Key generated! Public Key: " + data.publicKey);
        },
        onError: (err) => alert(err.message),
      });
    }
  };

  const handleRegisterKey = () => {
    registerKey(id, {
      onSuccess: () => alert("Key registered with Morning Consult!"),
      onError: (err) => alert(err.message),
    });
  };

  const handleSetRedirects = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const redirects = {
      default: `${origin}/api/surveys/redirect?status=unknown&session=[session_id]`,
      complete: `${origin}/api/surveys/redirect?status=complete&session=[session_id]&payout=[interview_cost]`,
      screenout: `${origin}/api/surveys/redirect?status=screenout&session=[session_id]`,
      over_quota: `${origin}/api/surveys/redirect?status=over_quota&session=[session_id]`,
      quality_term: `${origin}/api/surveys/redirect?status=quality_term&session=[session_id]`,
      timeout: `${origin}/api/surveys/redirect?status=timeout&session=[session_id]`,
    };

    setRedirects(
      { id, redirects },
      {
        onSuccess: () => alert("Redirects configured!"),
        onError: (err) => alert("Failed: " + err.message),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/providers">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">{provider?.name}</h1>
        {formData.isActive !== undefined && (
          <div className="flex items-center space-x-2 ml-auto">
            <Switch
              id="active-mode"
              checked={formData.isActive}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="active-mode">Active</Label>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug || ""}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Connection details for Morning Consult
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="apiBaseUrl">API Base URL</Label>
              <Input
                id="apiBaseUrl"
                name="apiBaseUrl"
                value={formData.apiBaseUrl || ""}
                onChange={handleChange}
                placeholder="https://api.morningconsultintelligence.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="credentials">API Key (Credentials)</Label>
              <Input
                id="credentials"
                name="credentials"
                value={formData.credentials || ""}
                onChange={handleChange}
                type="password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplierId">Supplier ID</Label>
              <Input
                id="supplierId"
                name="supplierId"
                value={formData.supplierId || ""}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Economics */}
        <Card>
          <CardHeader>
            <CardTitle>Economics</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="minCpiCents">Min CPI (Cents)</Label>
              <Input
                id="minCpiCents"
                name="minCpiCents"
                type="number"
                value={formData.minCpiCents || 0}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userPayoutPct">User Payout %</Label>
              <Input
                id="userPayoutPct"
                name="userPayoutPct"
                type="number"
                value={formData.userPayoutPct || 0}
                onChange={handleChange}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eligibilityCacheTtl">Cache TTL (Seconds)</Label>
              <Input
                id="eligibilityCacheTtl"
                name="eligibilityCacheTtl"
                type="number"
                value={formData.eligibilityCacheTtl || 0}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security & Keys */}
        <Card>
          <CardHeader>
            <CardTitle>Security & Keys</CardTitle>
            <CardDescription>
              Manage encryption keys for secure communication.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="font-medium">Encryption Key Pair</div>
                <div className="text-sm text-muted-foreground">
                  {provider?.publicKey
                    ? "Public key generated"
                    : "No key pair generated"}
                </div>
                {provider?.publicKey && (
                  <code className="text-xs bg-muted p-1 rounded block mt-2 max-w-sm truncate">
                    {provider.publicKey}
                  </code>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleGenerateKey}
                disabled={isGenerating}
              >
                <Key className="mr-2 h-4 w-4" />
                Generate New Key
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <div className="font-medium">Register with Provider</div>
                <div className="text-sm text-muted-foreground">
                  Uploads the public key to Morning Consult API.
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleRegisterKey}
                disabled={isRegistering || !provider?.publicKey}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Register Key
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Redirects */}
        <Card>
          <CardHeader>
            <CardTitle>Redirect Configuration</CardTitle>
            <CardDescription>
              Automatically configure redirect URLs with the provider.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSetRedirects}
              disabled={isSettingRedirects}
            >
              <Globe className="mr-2 h-4 w-4" />
              Auto-Configure Redirect URLs
            </Button>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Sets default, complete, screenout, and over-quota URLs to this
              domain.
            </p>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/providers">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={handleSave} disabled={isUpdating}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
