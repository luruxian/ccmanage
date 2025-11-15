import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useUserStore } from '@/store/user';
import SubscriptionPlans from '@/components/dashboard/SubscriptionPlans';

const Packages: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useUserStore();

  const handleDayCardClick = () => {
    // TODO: 实现一日体验卡购买逻辑
    console.log('一日体验卡购买');
  };

  const handleWeekCardClick = () => {
    // TODO: 实现七日行购买逻辑
    console.log('七日行购买');
  };

  const handleMonthCardClick = () => {
    // TODO: 实现月享卡购买逻辑
    console.log('月享卡购买');
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <SubscriptionPlans
          onDayCardClick={handleDayCardClick}
          onWeekCardClick={handleWeekCardClick}
          onMonthCardClick={handleMonthCardClick}
        />
      </div>
    </Layout>
  );
};

export default Packages;