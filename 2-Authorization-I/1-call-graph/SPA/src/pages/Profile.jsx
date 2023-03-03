import { useEffect, useState } from 'react';

import { ProfileData } from '../components/DataDisplay';
import { protectedResources } from '../authConfig';
import  useFetchWithMsal  from '../hooks/useFetchWithMsal' 

export const Profile = () => {
    const [graphData, setGraphData] = useState(null);
    const request = {
        scopes: protectedResources.graphMe.scopes,
    };
    const { error, execute, result } = useFetchWithMsal(request, protectedResources.graphMe.endpoint);   
     
    useEffect(() => {
        if (!!graphData) {
            return;
        }

        if (!graphData) {
            execute(protectedResources.graphMe.endpoint).then((data) => {
                setGraphData(data);
            });
        }

    }, [graphData, execute, result]);

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return <>{graphData ? <ProfileData response={result} graphData={graphData} /> : null}</>;
};
