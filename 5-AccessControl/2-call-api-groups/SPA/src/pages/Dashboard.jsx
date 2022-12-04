import { useEffect, useState } from 'react';

import { DashView } from '../components/DashView';
import { protectedResources } from "../authConfig";
import useFetchWithMsal from '../hooks/useFetchWithMsal';

export const Dashboard = () => {
    const { error, execute } = useFetchWithMsal({
        scopes: protectedResources.apiTodoList.scopes,
    });

    const [dashboardData, setDashboardData] = useState(null);

    useEffect(() => {
        if (!dashboardData) {
            execute("GET", protectedResources.apiTodoList.dashboardEndpoint).then((response) => {
                setDashboardData(response);
            });
        }
    }, [execute, dashboardData])

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return <>{dashboardData ? <DashView dashboardData={dashboardData} /> : null}</>;
};
