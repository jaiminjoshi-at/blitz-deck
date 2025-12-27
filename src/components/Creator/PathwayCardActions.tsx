'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import CardActions from '@mui/material/CardActions';
import { publishPathway, deletePathway } from '@/app/actions/content';
import ConfirmationDialog from '@/components/ConfirmationDialog';

interface PathwayCardActionsProps {
    packId: string;
    pathwayId: string;
    status: 'draft' | 'published';
}

export default function PathwayCardActions({ packId, pathwayId, status }: PathwayCardActionsProps) {
    const [isPublishing, setIsPublishing] = React.useState(false);
    const [publishConfirmOpen, setPublishConfirmOpen] = React.useState(false);

    const [isDeleting, setIsDeleting] = React.useState(false);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);

    const handlePublishClick = () => {
        setPublishConfirmOpen(true);
    };

    const handleConfirmPublish = async () => {
        setPublishConfirmOpen(false);
        setIsPublishing(true);
        const result = await publishPathway(packId, pathwayId);
        setIsPublishing(false);

        if (!result.success) {
            alert(result.error);
        }
    };

    const handleDeleteClick = () => {
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        setDeleteConfirmOpen(false);
        setIsDeleting(true);
        const result = await deletePathway(packId, pathwayId);
        setIsDeleting(false);

        if (!result.success) {
            alert(result.error);
        }
    };

    return (
        <CardActions>
            {/* Edit button removed as requested */}
            <Button
                size="small"
                color="error"
                onClick={handleDeleteClick}
                disabled={isDeleting || isPublishing}
            >
                {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>

            {status === 'draft' && (
                <>
                    <Button
                        size="small"
                        color="primary"
                        onClick={handlePublishClick}
                        disabled={isPublishing || isDeleting}
                    >
                        {isPublishing ? 'Publishing...' : 'Publish'}
                    </Button>
                    <ConfirmationDialog
                        open={publishConfirmOpen}
                        title="Publish Pathway?"
                        description="This pathway will become visible to all users. Are you sure you want to proceed?"
                        onConfirm={handleConfirmPublish}
                        onCancel={() => setPublishConfirmOpen(false)}
                        confirmText="Publish"
                    />
                </>
            )}

            <ConfirmationDialog
                open={deleteConfirmOpen}
                title="Delete Pathway?"
                description="This action cannot be undone. Are you sure you want to permanently delete this pathway?"
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                confirmText="Delete"
            />
        </CardActions>
    );
}
