import React from 'react';
import SubscriptionPlans from '@/components/dashboard/SubscriptionPlans';

const Packages: React.FC = () => {
  // const navigate = useNavigate();
  // const { isLoggedIn } = useUserStore();

  const handleDayCardClick = () => {
    // 跳转到一日体验卡购买页面
    window.open('https://www.goofish.com/item?spm=a21ybx.personal.feeds.1.747d2e8eCrK3sY&id=989321369149&categoryId=50023914', '_blank');
  };

  const handleWeekCardClick = () => {
    // 跳转到七日行购买页面
    window.open('https://www.goofish.com/item?spm=a21ybx.personal.feeds.3.747d2e8eCrK3sY&id=988003159682&categoryId=50023914', '_blank');
  };

  const handleMonthCardClick = () => {
    // 跳转到月享卡购买页面
    window.open('https://www.goofish.com/item?spm=a21ybx.personal.feeds.2.747d2e8eCrK3sY&id=989326213072&categoryId=50023914', '_blank');
  };

  return (
    <div className="container mx-auto py-6">
      <SubscriptionPlans
        onDayCardClick={handleDayCardClick}
        onWeekCardClick={handleWeekCardClick}
        onMonthCardClick={handleMonthCardClick}
      />
    </div>
  );
};

export default Packages;