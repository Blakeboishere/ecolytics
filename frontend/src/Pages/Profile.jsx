import "../Style/profile.css";

import {SectionTitle} from "../Components/SectionTitle";
import {DetailItem} from "../Components/DetailItem";
import {SummaryCard} from "../Components/SummaryCard";
import {DonationTable} from "../Components/DonationTable";
import {AnalyticsCard} from "../Components/AnalyticsCard";

export const Profile = ({ account }) => {

    const summaryData = [
        {
            icon: "♻",
            value: "245 kg",
            label: "Total Food Donated"
        },
        {
            icon: "🍽",
            value: "620",
            label: "Estimated Meals"
        },
        {
            icon: "🤝",
            value: "12",
            label: "Total Donations"
        },
        {
            icon: "🏆",
            value: "Gold",
            label: "Donor Level"
        }
    ];

    const donations = [
        {
            date: "20 Aug 2026",
            ngo: "Helping Hands Foundation",
            type: "Cooked Food",
            quantity: "25 kg",
            status: "Completed"
        },
        {
            date: "15 Aug 2026",
            ngo: "Annadaan Initiative",
            type: "Food Waste",
            quantity: "18 kg",
            status: "Completed"
        },
        {
            date: "08 Aug 2026",
            ngo: "Food For All Trust",
            type: "Cooked Food",
            quantity: "32 kg",
            status: "Completed"
        },
        {
            date: "01 Aug 2026",
            ngo: "Helping Hands Foundation",
            type: "Vegetables",
            quantity: "15 kg",
            status: "Completed"
        }
    ];

    return (
        <>

            <main className="profile-page">
                <section className="profile-header">

                    <div className="profile-avatar">
                        {account.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="profile-info">
                        <h1>{account.fullName}</h1>
                        <p>Food Donor</p>
                        <span>📍 Mumbai, Maharashtra</span>
                    </div>

                    <button className="edit-profile-btn">
                        Edit Profile
                    </button>

                </section>
                <section className="profile-details">

                    <SectionTitle
                        className="section-title"
                        label="ACCOUNT"
                        title="Profile Information"
                    />

                    <div className="details-grid">

                        <DetailItem
                            label="Full Name"
                            value={account.fullName}
                        />

                        <DetailItem
                            label="Email"
                            value={account.email}
                        />

                        <DetailItem
                            label="Phone"
                            value="+91 98765 43210"
                        />

                        <DetailItem
                            label="Organization"
                            value="ABC Canteen"
                        />

                        <DetailItem
                            label="Member Since"
                            value="January 2026"
                        />

                        <DetailItem
                            label="Account Status"
                            value="Active"
                            className="status-active"
                        />

                    </div>

                </section>

                <section className="donation-summary">

                    <SectionTitle
                        label="DONATIONS"
                        title="Your Donation Impact"
                    />

                    <div className="summary-grid">

                        {summaryData.map((item) => (
                            <SummaryCard
                                key={item.label}
                                {...item}
                            />
                        ))}

                    </div>

                </section>

                <section className="donation-history">

                    <SectionTitle
                        label="HISTORY"
                        title="Recent Donations"
                    />

                    <DonationTable
                        donations={donations}
                    />

                </section>

                <section className="analytics-section">

                    <SectionTitle
                        label="ANALYTICS"
                        title="Donation Analytics"
                        description="Track your donation activity and understand your contribution over time."
                    />

                    <div className="analytics-grid">

                        <AnalyticsCard
                            title="Monthly Donations"
                            subtitle="Donation quantity over time"
                            icon="📊"
                            heading="No donation data available"
                            description="Your monthly donation activity will appear here once you start making donations."
                        />

                        <AnalyticsCard
                            title="Donation Breakdown"
                            subtitle="Distribution by waste type"
                            icon="📈"
                            heading="Donation breakdown will appear here"
                            description="This section will show how your donations are distributed across different waste types."
                        />

                    </div>

                    <div className="impact-card empty-impact">

                        <div>
                            <span>DONATION IMPACT</span>

                            <h3>
                                Your environmental and social impact
                                will appear here.
                            </h3>

                            <p>
                                Once donation data is available, you will be able
                                to see the total food donated, meals supported,
                                and food waste diverted.
                            </p>
                        </div>

                        <div className="impact-placeholder">
                            --
                            <span>kg</span>
                        </div>

                    </div>

                </section>

            </main>
        </>
    );
};
