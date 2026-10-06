export const DonationTable = ({ donations }) => {
    return (
        <div className="table-container">

            <table>

                <thead>
                    <tr>
                        <th>Date</th>
                        <th>NGO</th>
                        <th>Waste Type</th>
                        <th>Quantity</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>

                    {donations.map((donation, index) => (
                        <tr key={index}>
                            <td>{donation.date}</td>
                            <td>{donation.ngo}</td>
                            <td>{donation.type}</td>
                            <td>{donation.quantity}</td>

                            <td>
                                <span className="completed">
                                    {donation.status}
                                </span>
                            </td>
                        </tr>
                    ))}

                </tbody>

            </table>

        </div>
    );
};
