import { useEffect, useState } from 'react';
import { getAllTasks } from '../fetch';
import { DashView } from '../components/DashView';

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

        // eslint-disable-next-line
    }, [dashboardData]);

    return <>{dashboardData ? <DashView dashboardData={dashboardData} /> : null}</>;
};
