import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ReactNode } from "react";

export type GroupListItem = {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  predictionCount: number;
  updatedAt?: Date | string | null;
  manageHref?: string;
  editHref?: string;
  detailHref?: string;
  actionSlot?: ReactNode;
};

type GroupListProps = {
  title?: string;
  description?: string;
  groups: GroupListItem[];
  emptyState?: ReactNode;
};

export default function GroupList({
  title = "Groups",
  description = "Manage forecasting groups within your organization.",
  groups,
  emptyState,
}: GroupListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {groups.length === 0 ? (
          emptyState || (
            <div className="text-center text-muted-foreground py-10">
              No groups have been created yet.
            </div>
          )
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Group Predictions</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="w-[220px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => {
                  const updatedLabel = group.updatedAt
                    ? formatDistanceToNow(new Date(group.updatedAt), {
                        addSuffix: true,
                      })
                    : "—";

                  return (
                    <TableRow key={group.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{group.name}</span>
                            {group.predictionCount > 0 && (
                              <Badge variant="secondary">
                                {group.predictionCount} predictions
                              </Badge>
                            )}
                          </div>
                          {group.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{group.memberCount}</TableCell>
                      <TableCell>{group.predictionCount}</TableCell>
                      <TableCell>{updatedLabel}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {group.manageHref && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={group.manageHref}>Members</Link>
                            </Button>
                          )}
                          {group.editHref && (
                            <Button variant="secondary" size="sm" asChild>
                              <Link href={group.editHref}>Edit</Link>
                            </Button>
                          )}
                          {group.actionSlot}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

