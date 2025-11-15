import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Layout from '@/components/Layout';
import { useUserStore } from '@/store/user';

interface Package {
  id: number;
  package_code: string;
  package_name: string;
  description?: string;
  endpoint?: string;
  price: number;
  credits: number;
  duration_days: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

const Packages: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    category: '',
    status: ''
  });
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packageDetailVisible, setPackageDetailVisible] = useState(false);

  // 检查用户认证状态
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // 加载包列表
  const loadPackages = async () => {
    try {
      setLoading(true);
      // TODO: 实现API调用
      // const params = {
      //   keyword: searchParams.keyword || undefined,
      //   category: searchParams.category || undefined,
      //   status: searchParams.status || undefined
      // };
      // const response = await request.get('/api/v1/packages', { params });
      // setPackages(response.packages || []);

      // 模拟数据
      setPackages([
        {
          id: 1,
          package_code: 'basic',
          package_name: '基础套餐',
          description: '适合个人开发者和小团队使用',
          price: 29.9,
          credits: 1000,
          duration_days: 30,
          is_active: true,
          sort_order: 1,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          package_code: 'pro',
          package_name: '专业套餐',
          description: '适合中小企业和专业开发者',
          price: 99.9,
          credits: 5000,
          duration_days: 30,
          is_active: true,
          sort_order: 2,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 3,
          package_code: 'enterprise',
          package_name: '企业套餐',
          description: '适合大型企业和重度用户',
          price: 299.9,
          credits: 20000,
          duration_days: 30,
          is_active: true,
          sort_order: 3,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('加载包列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      loadPackages();
    }
  }, [isLoggedIn]);

  const handleSearch = () => {
    loadPackages();
  };

  const handlePackageAction = (pkg: Package) => {
    setSelectedPackage(pkg);
    setPackageDetailVisible(true);
  };

  const handleCloseDetail = () => {
    setPackageDetailVisible(false);
    setSelectedPackage(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const packageCategories = [
    { label: '开发工具', value: 'development' },
    { label: '系统工具', value: 'system' },
    { label: '网络工具', value: 'network' },
    { label: '安全工具', value: 'security' },
    { label: '数据库', value: 'database' },
    { label: '其他', value: 'others' }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        {/* 页面头部 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">订阅管理</h1>
              <p className="text-muted-foreground">
                管理和浏览可用的订阅服务
              </p>
            </div>
            <Button onClick={loadPackages} disabled={loading}>
              {loading ? '刷新中...' : '刷新列表'}
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="keyword">搜索</Label>
                <Input
                  id="keyword"
                  placeholder="搜索订阅名称或描述"
                  value={searchParams.keyword}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    keyword: e.target.value
                  })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleSearch();
                  }}
                />
              </div>
              <div>
                <Label htmlFor="category">分类</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchParams.category}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    category: e.target.value
                  })}
                >
                  <option value="">选择分类</option>
                  {packageCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="status">状态</Label>
                <select
                  id="status"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchParams.status}
                  onChange={(e) => setSearchParams({
                    ...searchParams,
                    status: e.target.value
                  })}
                >
                  <option value="">全部</option>
                  <option value="available">可用</option>
                  <option value="unavailable">不可用</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleSearch} className="w-full">
                  搜索
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 包列表 */}
        <Card>
          <CardHeader>
            <CardTitle>订阅套餐</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">加载中...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订阅数据</h3>
                <p className="text-sm text-muted-foreground">
                  当前没有找到匹配的订阅服务
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {packages.map((pkg) => (
                  <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{pkg.package_name}</h3>
                          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded mt-1">
                            ¥{pkg.price}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                            pkg.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {pkg.is_active ? '可用' : '不可用'}
                          </span>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-sm mb-4">
                        {pkg.description || '暂无描述'}
                      </p>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>积分:</span>
                          <span>{pkg.credits}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>时长:</span>
                          <span>{pkg.duration_days} 天</span>
                        </div>
                        <div className="flex justify-between">
                          <span>创建时间:</span>
                          <span>{formatDate(pkg.created_at)}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <Button
                          onClick={() => handlePackageAction(pkg)}
                          disabled={!pkg.is_active}
                          className="w-full"
                        >
                          查看详情
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 包详情对话框 */}
        {packageDetailVisible && selectedPackage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>包详情</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>订阅名称:</strong>
                    <p>{selectedPackage.package_name}</p>
                  </div>
                  <div>
                    <strong>订阅代码:</strong>
                    <p>{selectedPackage.package_code}</p>
                  </div>
                  <div>
                    <strong>状态:</strong>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedPackage.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedPackage.is_active ? '可用' : '不可用'}
                    </span>
                  </div>
                  <div>
                    <strong>价格:</strong>
                    <p>¥{selectedPackage.price}</p>
                  </div>
                  <div className="col-span-2">
                    <strong>描述:</strong>
                    <p>{selectedPackage.description || '暂无描述'}</p>
                  </div>
                  <div>
                    <strong>创建时间:</strong>
                    <p>{formatDate(selectedPackage.created_at)}</p>
                  </div>
                  <div>
                    <strong>更新时间:</strong>
                    <p>{formatDate(selectedPackage.updated_at)}</p>
                  </div>
                  <div>
                    <strong>积分:</strong>
                    <p>{selectedPackage.credits}</p>
                  </div>
                  <div>
                    <strong>时长:</strong>
                    <p>{selectedPackage.duration_days} 天</p>
                  </div>
                </div>
              </CardContent>
              <div className="flex justify-end space-x-2 p-6 border-t">
                <Button variant="outline" onClick={handleCloseDetail}>
                  关闭
                </Button>
                {selectedPackage.is_active && (
                  <Button>
                    激活订阅
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Packages;