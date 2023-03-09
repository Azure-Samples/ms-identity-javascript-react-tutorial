import { useEffect, useState } from 'react';

import { ProfileData } from '../components/DataDisplay';
import { protectedResources } from '../authConfig';
import  useGraphWithMsal  from '../hooks/useGraphWithMsal' 

export const Profile = () => {
    const [graphData, setGraphData] = useState(null);

    const { error, execute, result } = useGraphWithMsal({
        scopes: protectedResources.graphMe.scopes,
    }, protectedResources.graphMe.endpoint);   
     
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
