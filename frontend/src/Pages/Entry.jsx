import {Form} from "../Components/Form";
import "../Style/Home.css";
import "../Style/Entry.css";
export const Entry = () => {
    return (
        <main className="entry-page">
            <header className="entry-heading">
                <p className="entry-eyebrow">WASTE TRACKING</p>
                <h1>Add a remnant entry</h1>
                <p>Record surplus food or waste from your facility. Your entry will be saved to your account.</p>
            </header>
            <section className="waste-form-container" aria-label="Remnant details">
                <Form />
            </section>
        </main>
    );
};
