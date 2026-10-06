import {Form} from "../Components/Form";
import "../Style/Home.css";
import "../Style/Entry.css";
export const Entry = () => {
    return(
        <>
        <main className="dashboard-container">
            <div className="dashboard-card">
            <div>
                <h1>Add Remnant Entry</h1>
                <p>Record the remnant generated in your facility.</p>
            </div>
        </div>
        <div className="waste-form-container">
            <Form />
        </div>
        </main>
        </>
    )
}