import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import request from '@/utils/request'

const UserKeyUsageHistory: React.FC = () => {
  const { apiKey } = useParams<{ apiKey: string }>()
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadHistory = async () => {
    if (!apiKey) return
    try {
      setLoading(true)
      const res: any = await request.get(`/admin/user-key-usage/${apiKey}`)
      setRows(res || [])
    } catch (err) {
      console.error('failed to load usage history', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey])

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">密钥使用记录</h2>
      <Card>
        <CardContent>
          {loading && <div>加载中...</div>}
          {!loading && rows.length === 0 && <div>暂无记录</div>}
          {!loading && rows.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>请求路径</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>耗时(ms)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(r.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{r.path}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell>{r.duration_ms}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default UserKeyUsageHistory
