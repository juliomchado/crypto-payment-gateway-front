'use client'

import { MoreHorizontal, Trash2, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/utils'
import type { ApiKey } from '@/models/types'
import { useState } from 'react'

interface ApiKeyTableProps {
  apiKeys: ApiKey[]
  isLoading?: boolean
  onRevoke?: (key: ApiKey) => void
  onRotate?: (key: ApiKey) => void
  onCopy?: (key: string) => void
}

export function ApiKeyTable({ apiKeys, isLoading, onRevoke, onRotate, onCopy }: ApiKeyTableProps) {
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(keyId)) {
        newSet.delete(keyId)
      } else {
        newSet.add(keyId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (apiKeys.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-muted-foreground">No API keys found</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Last Used</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiKeys.map((apiKey) => {
            const isVisible = visibleKeys.has(apiKey.id)
            const displayKey = isVisible
              ? `pk_live_${'*'.repeat(28)}${apiKey.keyHint}`
              : `pk_live_${'•'.repeat(28)}${apiKey.keyHint}`

            return (
              <TableRow key={apiKey.id}>
                <TableCell className="font-medium">{apiKey.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <code className="text-xs">{displayKey}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleKeyVisibility(apiKey.id)}
                    >
                      {isVisible ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {apiKey.lastUsedAt ? formatDateTime(apiKey.lastUsedAt) : 'Never'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDateTime(apiKey.createdAt)}
                </TableCell>
                <TableCell>
                  <Badge variant={apiKey.status === 'REVOKED' ? 'destructive' : 'success'}>
                    {apiKey.status === 'REVOKED' ? 'Revoked' : 'Active'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onCopy?.(`pk_live_${'*'.repeat(28)}${apiKey.keyHint}`)}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Key Hint
                      </DropdownMenuItem>
                      {apiKey.status === 'ACTIVE' && (
                        <>
                          <DropdownMenuItem onClick={() => onRotate?.(apiKey)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Rotate Key
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => onRevoke?.(apiKey)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Revoke
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
