import { useState } from 'react';

export const NGOCard = ({ category, name, description, location, phone, email }) => {
    const [showPhone, setShowPhone] = useState(false);
    return (
        <div className="ngo-card">
            <div className="ngo-image"><div className="ngo-placeholder">NGO</div></div>
            <div className="ngo-content">
                <span className="ngo-category">{category}</span>
                <h3>{name}</h3>
                <p>{description}</p>
                <div className="ngo-info"><span>📍 {location}</span><span>✓ Registered</span></div>
                {phone ? <><button type="button" className="donate-btn" onClick={() => setShowPhone((shown) => !shown)}>{showPhone ? 'Hide phone number' : 'Show phone number'}</button>{showPhone && <a className="ngo-phone-number" href={`tel:${phone}`}>{phone}</a>}</> : email ? <a className="donate-btn" href={`mailto:${email}`}>Email NGO</a> : <span>Contact details unavailable</span>}
            </div>
        </div>
    );
};
