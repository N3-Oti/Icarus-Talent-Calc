// src/components/PointTotals.tsx
import { Box, Typography } from '@mui/material';
import { pointPools, TalentPool} from '../data/points.ts';
import { getPointsSpentInPool, getPointsSpentInTree } from '../utils/pointsSpent.ts';
import { Trees } from '../data/talentTreeMap.ts';

interface PointTotalsProps {
    talentPoints: Record<string, Record<string, number>>;
    selectedTree: keyof typeof Trees | null;
}

export default function PointTotals({ talentPoints, selectedTree }: PointTotalsProps) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, mt: 1 }}>
            {Object.entries(pointPools).map(([poolKey, pool]) => {
                const isPerTreeCap = pool.perTreeCap || false;
                const isActiveTree = isPerTreeCap && selectedTree && pool.trees.includes(selectedTree as keyof typeof Trees);

                let spent: number;
                let pointRender: string;
                let isMaxed: boolean;

                if (isActiveTree) {
                    spent = getPointsSpentInTree(selectedTree as keyof typeof Trees, talentPoints);
                    pointRender = `${spent} / ${pool.cap}`;
                    isMaxed = spent >= pool.cap;
                } else if (isPerTreeCap) {
                    spent = 0;
                    pointRender = `${pool.cap} per Tree`;
                    isMaxed = false;
                } else {
                    spent = getPointsSpentInPool(poolKey as TalentPool, talentPoints);
                    pointRender = `${spent} / ${pool.cap}`;
                    isMaxed = spent >= pool.cap;
                }

                return (
                    <Box
                        key={poolKey}
                        sx={{
                            px: 2,
                            py: 1,
                            border: '1px solid #444',
                            borderRadius: 1,
                            backgroundColor: '#1c1c1c',
                            color: '#ccc',
                            display: 'flex',
                            flexDirection: 'column',
                            minWidth: 100,
                            textAlign: 'center'
                        }}
                    >
                        <Typography variant="caption" sx={{ color: '#999' }}>
                            {isActiveTree ? Trees[selectedTree!].name : poolKey} Points
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontWeight: 'bold',
                                color: isMaxed ? 'red' : '#ffba27'
                            }}
                        >
                            {pointRender}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    );
}
