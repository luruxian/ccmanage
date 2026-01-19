import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUserStore } from '@/store/user'
import request from '@/utils/request'
import { useToast } from '@/components/ui/ToastProvider'
import { Users, Package, History, FileText, BarChart3, Menu, X } from 'lucide-react'

interface StatisticState {
  total_users: number
  active_users: number
  total_packages: number
  total_api_keys: number
}

type MenuItemType = 'users' | 'packages' | 'login-history' | 'admin-ops' | 'statistics'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const { user, logout } = useUserStore()
  const { info } = useToast()

  const [statistics, setStatistics] = useState<StatisticState>({
    total_users: 0,
    active_users: 0,
    total_packages: 0,
    total_api_keys: 0,
  })

  const [users, setUsers] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [activeMenu, setActiveMenu] = useState<MenuItemType>('users')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [userPage, setUserPage] = useState(1)
  const userPageSize = 20
  const [userTotal, setUserTotal] = useState(0)

  // 创建订阅相关状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newPackage, setNewPackage] = useState({
    package_code: '',
    package_name: '',
    description: '',
    price: '',
    credits: '',
    duration_days: '',
    package_type: '01',
    is_active: true,
    sort_order: '0'
  })

  const handleLogout = () => {
    logout()
    navigate('/meme', { replace: true })
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const loadStatistics = async () => {
    try {
        const res: any = await request.get('/admin/statistics')
      setStatistics((prev) => ({ ...prev, ...res }))
    } catch (err) {
      console.error('failed to load admin statistics', err)
    }
  }

  const loadUsers = async () => {
    try {
        const res: any = await request.get('/admin/users', {
        params: { page: userPage, page_size: userPageSize }
      })
      setUsers(res.users || [])
      setUserTotal(res.total || 0)
    } catch (err) {
      console.error('failed to load admin users', err)
    }
  }

  const loadPackages = async () => {
    try {
        const res: any = await request.get('/packages/', { params: { include_inactive: true } })
      setPackages(res.packages || [])
    } catch (err) {
      console.error('failed to load packages', err)
    }
  }

  const handleCreatePackage = async () => {
    try {
      // 验证必填字段
      if (!newPackage.package_code || !newPackage.package_name || !newPackage.price ||
          !newPackage.credits || !newPackage.duration_days) {
        info('请填写所有必填字段')
        return
      }

      // 转换数据类型
      const packageData = {
        ...newPackage,
        price: parseFloat(newPackage.price),
        credits: parseInt(newPackage.credits),
        duration_days: parseInt(newPackage.duration_days),
        sort_order: parseInt(newPackage.sort_order)
      }

      const res = await request.post('/packages/', packageData)

      if (res) {
        info('订阅创建成功')
        setCreateDialogOpen(false)
        // 重置表单
        setNewPackage({
          package_code: '',
          package_name: '',
          description: '',
          price: '',
          credits: '',
          duration_days: '',
          package_type: '01',
          is_active: true,
          sort_order: '0'
        })
        // 重新加载套餐列表
        loadPackages()
      }
    } catch (err: any) {
      console.error('创建订阅失败', err)
      info(err.response?.data?.detail || '创建订阅失败')
    }
  }

  const handleNewPackageChange = (field: string, value: string) => {
    setNewPackage(prev => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(() => {
    loadStatistics()
    loadUsers()
    loadPackages()
  }, [userPage])

  const handleMenuSelect = (menu: MenuItemType) => {
    setActiveMenu(menu)
    closeMobileMenu()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">
              🛡️ 管理中心
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="destructive" size="sm" onClick={handleLogout}>退出</Button>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.total_users}</div>
                  <div className="text-sm text-gray-600">总用户数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                  <Users size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.active_users}</div>
                  <div className="text-sm text-gray-600">活跃用户</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                  <Package size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.total_packages}</div>
                  <div className="text-sm text-gray-600">总订阅数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-3xl font-bold text-gray-900">{statistics.total_api_keys}</div>
                  <div className="text-sm text-gray-600">用户Key</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 移动端菜单切换按钮 */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg z-40 hover:bg-blue-700"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* 移动端遮罩层 */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={closeMobileMenu}
        />
      )}

      {/* 主要功能区域 */}
      <div className="px-6 pb-6 flex gap-6">
        {/* 左侧菜单 */}
        <div
          className={`fixed md:relative left-0 top-0 w-64 md:w-60 h-screen md:h-auto bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-300 z-30 md:z-auto
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
        >
          <div className="p-4 border-b border-gray-200 md:hidden">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">管理菜单</h3>
              <button onClick={closeMobileMenu} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
          </div>

          <nav className="p-2 space-y-1">
            {[
              { id: 'users' as MenuItemType, label: '用户管理', icon: Users },
              { id: 'packages' as MenuItemType, label: '订阅管理', icon: Package },
              { id: 'login-history' as MenuItemType, label: '登录历史', icon: History },
              { id: 'admin-ops' as MenuItemType, label: '操作记录', icon: FileText },
              { id: 'statistics' as MenuItemType, label: '统计报表', icon: BarChart3 },
            ].map((item) => {
              const IconComponent = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuSelect(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeMenu === item.id
                      ? 'bg-blue-100 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <IconComponent size={18} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 min-w-0">
          {/* 用户管理 */}
          {activeMenu === 'users' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>用户管理</CardTitle>
                <Button size="sm" onClick={loadUsers}>刷新</Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>邮箱</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>用户Key</TableHead>
                        <TableHead>注册时间</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.email}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {u.role === 'admin' ? '管理员' : '用户'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {u.is_active ? '激活' : '禁用'}
                            </span>
                          </TableCell>
                          <TableCell>{u.total_api_keys}</TableCell>
                          <TableCell className="text-sm">{new Date(u.created_at).toLocaleString('zh-CN')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => info('功能未实现')}>切换状态</Button>
                              <Button size="sm" variant="ghost" onClick={() => info('功能未实现')}>详情</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-gray-600">共 {userTotal} 条</span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      disabled={userPage === 1}
                    >
                      上一页
                    </Button>
                    <span className="px-2 py-1">{userPage}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setUserPage((p) => p + 1)}
                      disabled={users.length < userPageSize}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 订阅管理 */}
          {activeMenu === 'packages' && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>订阅管理</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">新增订阅</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>创建新订阅</DialogTitle>
                        <DialogDescription>
                          填写订阅信息，所有带*的字段为必填项。
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="package_code" className="text-right">
                            订阅代码*
                          </Label>
                          <Input
                            id="package_code"
                            value={newPackage.package_code}
                            onChange={(e) => handleNewPackageChange('package_code', e.target.value)}
                            className="col-span-3"
                            placeholder="如：basic_monthly"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="package_name" className="text-right">
                            订阅名称*
                          </Label>
                          <Input
                            id="package_name"
                            value={newPackage.package_name}
                            onChange={(e) => handleNewPackageChange('package_name', e.target.value)}
                            className="col-span-3"
                            placeholder="如：基础月套餐"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">
                            描述
                          </Label>
                          <Input
                            id="description"
                            value={newPackage.description}
                            onChange={(e) => handleNewPackageChange('description', e.target.value)}
                            className="col-span-3"
                            placeholder="订阅描述"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="price" className="text-right">
                            价格*
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={newPackage.price}
                            onChange={(e) => handleNewPackageChange('price', e.target.value)}
                            className="col-span-3"
                            placeholder="如：99.99"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="credits" className="text-right">
                            积分*
                          </Label>
                          <Input
                            id="credits"
                            type="number"
                            value={newPackage.credits}
                            onChange={(e) => handleNewPackageChange('credits', e.target.value)}
                            className="col-span-3"
                            placeholder="如：10000"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="duration_days" className="text-right">
                            时长(天)*
                          </Label>
                          <Input
                            id="duration_days"
                            type="number"
                            value={newPackage.duration_days}
                            onChange={(e) => handleNewPackageChange('duration_days', e.target.value)}
                            className="col-span-3"
                            placeholder="如：30"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="package_type" className="text-right">
                            订阅类型*
                          </Label>
                          <Select
                            value={newPackage.package_type}
                            onValueChange={(value) => handleNewPackageChange('package_type', value)}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue placeholder="选择订阅类型" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="01">01 - 标准订阅</SelectItem>
                              <SelectItem value="91">91 - 加油包（只累加积分）</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="sort_order" className="text-right">
                            排序顺序
                          </Label>
                          <Input
                            id="sort_order"
                            type="number"
                            value={newPackage.sort_order}
                            onChange={(e) => handleNewPackageChange('sort_order', e.target.value)}
                            className="col-span-3"
                            placeholder="如：0"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit" onClick={handleCreatePackage}>创建订阅</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button size="sm" onClick={loadPackages}>刷新</Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>订阅名称</TableHead>
                        <TableHead>代码</TableHead>
                        <TableHead>类型</TableHead>
                        <TableHead>价格</TableHead>
                        <TableHead>积分</TableHead>
                        <TableHead>时长</TableHead>
                        <TableHead>状态</TableHead>
                        <TableHead>操作</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {packages.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>
                            <button
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                              onClick={() => navigate(`/admin/subscription/${p.id}`)}
                            >
                              {p.package_name}
                            </button>
                          </TableCell>
                          <TableCell>{p.package_code}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              p.package_type === '91' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {p.package_type === '91' ? '加油包' : '标准订阅'}
                            </span>
                          </TableCell>
                          <TableCell>¥{p.price}</TableCell>
                          <TableCell>{p.credits}</TableCell>
                          <TableCell>{p.duration_days}天</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {p.is_active ? '激活' : '禁用'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => info('编辑功能未实现')}>编辑</Button>
                              <Button size="sm" variant="outline" onClick={() => info('切换功能未实现')}>切换</Button>
                              <Button size="sm" variant="destructive" onClick={() => info('删除功能未实现')}>删除</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 登录历史 */}
          {activeMenu === 'login-history' && (
            <Card>
              <CardHeader>
                <CardTitle>登录历史</CardTitle>
              </CardHeader>
              <CardContent className="py-20 text-center">
                <History size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">登录历史功能正在开发中...</p>
              </CardContent>
            </Card>
          )}

          {/* 操作记录 */}
          {activeMenu === 'admin-ops' && (
            <Card>
              <CardHeader>
                <CardTitle>管理员操作记录</CardTitle>
              </CardHeader>
              <CardContent className="py-20 text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">操作记录功能正在开发中...</p>
              </CardContent>
            </Card>
          )}

          {/* 统计报表 */}
          {activeMenu === 'statistics' && (
            <Card>
              <CardHeader>
                <CardTitle>统计报表</CardTitle>
              </CardHeader>
              <CardContent className="py-20 text-center">
                <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">统计报表功能正在开发中...</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
