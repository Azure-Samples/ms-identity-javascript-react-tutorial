import { useEffect, useState } from 'react';

import { DashView } from '../components/DashView';
import { getAllTasks } from '../fetch';

export const Dashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    
    useEffect(() => {
        if (!dashboardData) {
            getAllTasks()
                .then((response) => {
                    if (response && response.error) throw response.error;
                    setDashboardData(response);
                })
                .catch((error) => {
                    console.log(error);
                });
        }

    }, [dashboardData]);

    return <>{dashboardData ? <DashView dashboardData={dashboardData} /> : null}</>;
};
