import { useState } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { SavedBuildsMap, deleteBuild, renameBuild, saveBuild } from '../utils/savedBuilds';
import { calculatePointsSpent, isVersionMismatch } from '../utils/exportImport';

interface SaveLoadPanelProps {
    talentPoints: Record<string, Record<string, number>>;
    setTalentPoints: (v: Record<string, Record<string, number>>) => void;
    setTalentPointsSpent: (v: Record<string, number>) => void;
    savedBuilds: SavedBuildsMap;
    setSavedBuilds: (v: SavedBuildsMap) => void;
    onMessage: (msg: string) => void;
}

export default function SaveLoadPanel({
    talentPoints,
    setTalentPoints,
    setTalentPointsSpent,
    savedBuilds,
    setSavedBuilds,
    onMessage,
}: SaveLoadPanelProps) {
    const [open, setOpen] = useState(false);
    const [saveName, setSaveName] = useState('');
    const [renameTarget, setRenameTarget] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    const buildNames = Object.keys(savedBuilds).sort((a, b) =>
        new Date(savedBuilds[b].savedAt).getTime() - new Date(savedBuilds[a].savedAt).getTime()
    );

    const handleSave = () => {
        const name = saveName.trim();
        if (!name) return;
        const updated = saveBuild(name, talentPoints);
        setSavedBuilds(updated);
        setSaveName('');
        onMessage(`"${name}" を保存しました。`);
    };

    const handleLoad = (name: string) => {
        const build = savedBuilds[name];
        if (!build) return;

        setTalentPoints(build.talentPoints);
        setTalentPointsSpent(calculatePointsSpent(build.talentPoints));
        setOpen(false);

        if (isVersionMismatch(build.gameVersion)) {
            onMessage(`"${name}" を読み込みました（バージョン不一致。ツリーを確認してください）。`);
        } else {
            onMessage(`"${name}" を読み込みました。`);
        }
    };

    const handleDelete = (name: string) => {
        const updated = deleteBuild(name);
        setSavedBuilds(updated);
        onMessage(`"${name}" を削除しました。`);
    };

    const handleRenameConfirm = () => {
        if (!renameTarget) return;
        const newName = renameValue.trim();
        if (!newName || newName === renameTarget) {
            setRenameTarget(null);
            return;
        }
        if (savedBuilds[newName]) {
            onMessage(`"${newName}" はすでに存在します。`);
            return;
        }
        const updated = renameBuild(renameTarget, newName);
        setSavedBuilds(updated);
        setRenameTarget(null);
        onMessage(`"${renameTarget}" を "${newName}" にリネームしました。`);
    };

    return (
        <>
            <Button startIcon={<SaveIcon />} onClick={() => setOpen(true)}>
                Saved Builds
            </Button>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Saved Builds</DialogTitle>
                <DialogContent>
                    {/* Save current build */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, mt: 1 }}>
                        <TextField
                            size="small"
                            label="Build name"
                            value={saveName}
                            onChange={e => setSaveName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                            fullWidth
                        />
                        <Button variant="contained" onClick={handleSave} disabled={!saveName.trim()}>
                            Save
                        </Button>
                    </Box>

                    {/* Build list */}
                    {buildNames.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No saved builds yet.
                        </Typography>
                    ) : (
                        <List dense disablePadding>
                            {buildNames.map(name => (
                                <ListItem
                                    key={name}
                                    disablePadding
                                    secondaryAction={
                                        <Box sx={{ display: 'flex' }}>
                                            <Tooltip title="Rename">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => {
                                                        setRenameTarget(name);
                                                        setRenameValue(name);
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDelete(name)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    }
                                >
                                    <ListItemButton onClick={() => handleLoad(name)}>
                                        <ListItemText
                                            primary={name}
                                            secondary={`v${savedBuilds[name].gameVersion} · ${new Date(savedBuilds[name].savedAt).toLocaleString()}`}
                                            slotProps={{ secondary: { style: { fontSize: '0.7rem' } } }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Rename Dialog */}
            <Dialog open={!!renameTarget} onClose={() => setRenameTarget(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Rename Build</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        label="New name"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleRenameConfirm()}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleRenameConfirm}>Rename</Button>
                    <Button onClick={() => setRenameTarget(null)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
