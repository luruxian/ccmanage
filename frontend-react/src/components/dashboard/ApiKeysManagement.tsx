import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import request from '@/utils/request';

interface ApiKey {
  id?: string;
  user_key_id: string;
  key_name: string;
  api_key: string;
  is_active: boolean;
  usage_count?: number;
  last_used_at?: string;
  created_at: string;
  package_name?: string;
  activation_date?: string;
  expire_date?: string;
  remaining_days?: number;
  status?: string;
  total_credits?: number;
  remaining_credits?: number;
}

interface ApiKeysManagementProps {
  apiKeys: ApiKey[];
  loadingKeys: boolean;
  keyStats: { active: number };
  onRefreshKeys: () => void;
  onViewUsageHistory: (key: ApiKey) => void;
  onResetCredits: (key: ApiKey) => void;
  onDownloadConfig: (key: ApiKey) => void;
}

// Utility functions
const maskApiKey = (apiKey: string) => {
  if (!apiKey) return '-';
  if (apiKey.length <= 8) return apiKey;
  return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
};

const getStatusVariant = (status?: string) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'expired':
      return 'destructive';
    case 'inactive':
    default:
      return 'secondary';
  }
};

const getStatusText = (status?: string) => {
  switch (status) {
    case 'active':
      return '激活';
    case 'expired':
      return '过期';
    case 'inactive':
    default:
      return '未激活';
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage > 50) return 'bg-green-500';
  if (percentage > 20) return 'bg-yellow-500';
  return 'bg-red-500';
};

const formatDateShort = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('zh-CN');
};

const getRemainingDaysClass = (days?: number) => {
  if (days === undefined || days === null) return 'text-muted-foreground';
  if (days <= 3) {
    return 'text-red-600 font-bold';
  } else if (days <= 7) {
    return 'text-yellow-600 font-bold';
  }
  return 'text-green-600';
};

const getRemainingCreditsClass = (remainingCredits?: number, totalCredits?: number) => {
  if (remainingCredits === undefined || totalCredits === undefined) return 'text-muted-foreground';
  if (!totalCredits || totalCredits <= 0) {
    return 'text-muted-foreground';
  }

  const percentage = (remainingCredits / totalCredits) * 100;

  if (percentage <= 10) {
    return 'text-red-600 font-bold';
  } else if (percentage <= 30) {
    return 'text-yellow-600 font-bold';
  }
  return 'text-green-600';
};

const copyApiKey = async (apiKey: string) => {
  try {
    await navigator.clipboard.writeText(apiKey);
    alert('API密钥已复制到剪贴板');
  } catch (error) {
    alert('复制失败，请手动复制');
  }
};

const ApiKeysManagement: React.FC<ApiKeysManagementProps> = ({
  apiKeys,
  loadingKeys,
  keyStats,
  onRefreshKeys,
  onViewUsageHistory,
  onResetCredits,
  onDownloadConfig
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center space-x-2">
            <span>🔑</span>
            <span>API密钥管理</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
          {loadingKeys ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">暂无密钥</h3>
              <p className="text-sm text-muted-foreground mb-4">
                您还没有创建任何API密钥
              </p>
              <Button onClick={() => navigate('/packages')}>
                立即激活密钥
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">订阅名称</TableHead>
                    <TableHead className="w-[180px]">API密钥</TableHead>
                    <TableHead className="w-[80px]">状态</TableHead>
                    <TableHead className="w-[100px]">激活时间</TableHead>
                    <TableHead className="w-[100px]">过期时间</TableHead>
                    <TableHead className="w-[80px]">剩余天数</TableHead>
                    <TableHead className="w-[160px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiKeys
                    .filter((key) => key.status === 'active') // 只显示激活状态的密钥
                    .map((key) => (
                    <React.Fragment key={key.user_key_id}>
                      {/* 第一行：主要信息 */}
                      <TableRow>
                        <TableCell>
                          <div className="font-medium">
                            {key.package_name || '未知订阅'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {maskApiKey(key.api_key)}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyApiKey(key.api_key)}
                            >
                              复制
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(key.status)}>
                            {getStatusText(key.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {key.activation_date ? formatDateShort(key.activation_date) : '未激活'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {key.expire_date ? formatDateShort(key.expire_date) : '永久'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm ${getRemainingDaysClass(key.remaining_days)}`}>
                            {key.remaining_days !== null ? `${key.remaining_days}天` : '永久'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              onClick={() => onViewUsageHistory(key)}
                            >
                              履历
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onResetCredits(key)}
                            >
                              重置
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDownloadConfig(key)}
                            >
                              下载
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {/* 第二行：积分信息 */}
                      <TableRow>
                        <TableCell colSpan={7} className="bg-muted/50">
                          <div className="flex justify-between items-center py-2">
                            <div className="flex space-x-6 text-sm">
                              <div>
                                <span className="text-muted-foreground">总积分：</span>
                                <span>
                                  {key.total_credits !== null ? key.total_credits : '-'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">剩余积分：</span>
                                <span className={getRemainingCreditsClass(key.remaining_credits, key.total_credits)}>
                                  {key.remaining_credits !== null ? key.remaining_credits : '-'}
                                </span>
                              </div>
                            </div>
                            {key.total_credits && key.total_credits > 0 && (
                              <div className="w-40">
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-muted-foreground">剩余积分</span>
                                  <span>
                                    {Math.round(((key.remaining_credits || 0) / key.total_credits) * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getProgressColor(Math.round(((key.remaining_credits || 0) / key.total_credits) * 100))}`}
                                    style={{ width: `${Math.round(((key.remaining_credits || 0) / key.total_credits) * 100)}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
  );
};

export default ApiKeysManagement;