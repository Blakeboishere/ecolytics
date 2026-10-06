import {useParams} from 'react-router-dom';
export const WasteDetails = () => {
    const {type} = useParams();
    return(
        <>
        <h1>{type} Waste Details</h1>
        </>
    )
}