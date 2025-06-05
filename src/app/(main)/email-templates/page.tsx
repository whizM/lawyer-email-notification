"use client"

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
    LoaderCircle,
    Plus,
    Edit,
    Trash2,
    Mail,
    Save,
    X
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        subject: '',
        content: '',
    });

    const fetchTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/email-templates');
            const data = await response.json();

            if (response.ok) {
                setTemplates(data.templates || []);
            } else {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch email templates',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error fetching templates:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch email templates',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const resetForm = () => {
        setFormData({ name: '', subject: '', content: '' });
        setEditingTemplate(null);
    };

    const handleOpenDialog = (template?: EmailTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                name: template.name || '',
                subject: template.subject || '',
                content: template.content || '',
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = editingTemplate
                ? `/api/email-templates/${editingTemplate.id}`
                : '/api/email-templates';

            const method = editingTemplate ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: data.message,
                });
                handleCloseDialog();
                fetchTemplates();
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'Something went wrong',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error submitting template:', error);
            toast({
                title: 'Error',
                description: 'Failed to save email template',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (templateId: string) => {
        setIsDeleting(templateId);

        try {
            const response = await fetch(`/api/email-templates/${templateId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: 'Success',
                    description: 'Email template deleted successfully',
                });
                fetchTemplates();
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'Failed to delete template',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error deleting template:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete email template',
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(null);
        }
    };

    if (isLoading) {
        return (
            <div className="container space-y-6 p-6 pb-16">
                <div className="flex items-center justify-center py-8">
                    <LoaderCircle className="h-8 w-8 animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="container space-y-6 p-6 pb-16">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <h2 className="text-2xl font-bold tracking-tight">Email Templates</h2>
                    <p className="text-muted-foreground">
                        Manage your email templates for automated communications.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <Button onClick={() => handleOpenDialog()}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Template
                    </Button>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>
                                {editingTemplate ? 'Edit Email Template' : 'Create New Email Template'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingTemplate
                                    ? 'Update your email template details below.'
                                    : 'Create a new email template for automated communications.'
                                }
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Template Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Welcome Email, Report Notification"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject">Email Subject</Label>
                                    <Input
                                        id="subject"
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Enter email subject line"
                                        required
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="content">Email Content</Label>
                                    <Textarea
                                        id="content"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="Enter your email content here..."
                                        className="min-h-[200px]"
                                        required
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        You can use HTML formatting for rich content.
                                    </p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                                    <X className="mr-2 h-4 w-4" />
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            {editingTemplate ? 'Updating...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            {editingTemplate ? 'Update Template' : 'Create Template'}
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {templates.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Email Templates</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            You haven&apos;t created any email templates yet. Create your first template to get started.
                        </p>
                        <Button onClick={() => handleOpenDialog()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Your First Template
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {templates.map((template) => (
                        <Card key={template.id}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">{template.name}</CardTitle>
                                        <CardDescription>
                                            <strong>Subject:</strong> {template.subject}
                                        </CardDescription>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenDialog(template)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={isDeleting === template.id}
                                                >
                                                    {isDeleting === template.id ? (
                                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete Email Template</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to delete &quot;{template.name}&quot;? This action cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(template.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="text-sm">
                                        <strong>Content Preview:</strong>
                                    </div>
                                    <div className="p-3 bg-muted rounded-md text-sm max-h-32 overflow-y-auto">
                                        {template.content ? (
                                            <div dangerouslySetInnerHTML={{ __html: template.content.substring(0, 200) + (template.content.length > 200 ? '...' : '') }} />
                                        ) : (
                                            <span className="text-muted-foreground">No content</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground pt-2">
                                        Created: {new Date(template.createdAt).toLocaleDateString()}
                                        {template.updatedAt !== template.createdAt && (
                                            <> • Updated: {new Date(template.updatedAt).toLocaleDateString()}</>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
} 