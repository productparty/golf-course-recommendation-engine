// components/ClubDetailPage.tsx
import { useParams } from 'react-router-dom';
import { useMap } from './hooks/useMap';

interface Club {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    // Add other fields like holes, features, etc.
}

export const ClubDetailPage = () => {
    const { id } = useParams();
    const [club, setClub] = useState<Club | null>(null);
    const { mapContainer, map } = useMap({ center: [club?.longitude || 0, club?.latitude || 0], radius: 500 });

    useEffect(() => {
        // Fetch club data from your backend
        fetch(`/api/clubs/${id}`)
            .then(res => res.json())
            .then(data => setClub(data));
    }, [id]);

    return (
        <div className="club-detail-container">
            {mapContainer}
            <div className="club-info">
                <h1>{club?.name}</h1>
                <p>{club?.address}</p>
                {/* Add additional club information here */}
            </div>
        </div>
    );
};