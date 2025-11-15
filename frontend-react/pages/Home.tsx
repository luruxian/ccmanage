import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, CreditCard, BarChart3, TrendingUp } from 'lucide-react'

export default function Home() {
  const stats = [
    {
      title: '总用户数',
      value: '1,234',
      description: '+12% 较上月',
      icon: Users,
      color: 'text-primary',
    },
    {
      title: '总积分',
      value: '56,789',
      description: '+8% 较上月',
      icon: CreditCard,
      color: 'text-success',
    },
    {
      title: '活跃用户',
      value: '892',
      description: '+15% 较上月',
      icon: TrendingUp,
      color: 'text-warning',
    },
    {
      title: 'API调用',
      value: '45,678',
      description: '+23% 较上月',
      icon: BarChart3,
      color: 'text-secondary',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">仪表板</h1>
        <p className="text-muted-foreground">
          欢迎来到CCManage管理系统
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>
              显示最近的用户活动和系统事件
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 rounded-full bg-primary"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">新用户注册</p>
                  <p className="text-sm text-muted-foreground">
                    用户 "张三" 刚刚注册了账户
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">2分钟前</div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 rounded-full bg-success"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">积分充值</p>
                  <p className="text-sm text-muted-foreground">
                    用户 "李四" 充值了100积分
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">5分钟前</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
            <CardDescription>
              常用功能快速入口
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                添加新用户
              </Button>
              <Button className="w-full justify-start" variant="outline">
                积分管理
              </Button>
              <Button className="w-full justify-start" variant="outline">
                生成报表
              </Button>
              <Button className="w-full justify-start" variant="outline">
                系统设置
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}