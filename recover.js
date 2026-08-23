// ==========================================
// CAMPUSPASS - FIND MY PASS
// ==========================================


// ------------------------------------------
// SUPABASE CONFIG
// ------------------------------------------

const SUPABASE_URL =
    "https://ndabsbxraxkwmgwbvroq.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_X-3moJPFNv7sqI3hp1fcMw_3LKmRBfW";

const db =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ------------------------------------------
// Current Pass Storage
// ------------------------------------------

const CURRENT_PASS_KEY =
    "JEMS_CURRENT_PASS";


// ------------------------------------------
// Elements
// ------------------------------------------

const recoverForm =
    document.getElementById(
        "recoverForm"
    );

const messageBox =
    document.getElementById(
        "message"
    );

const findPassBtn =
    document.getElementById(
        "findPassBtn"
    );


// ------------------------------------------
// Show Message
// ------------------------------------------

function showMessage(
    message,
    type = "success"
) {

    messageBox.textContent =
        message;

    messageBox.style.color =
        type === "error"
            ? "#c62828"
            : "#188038";
}


// ------------------------------------------
// Find Pass
// ------------------------------------------

recoverForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const branch =
            document
                .getElementById("branch")
                .value
                .trim();


        const rollNo =
            document
                .getElementById("rollNo")
                .value
                .trim();


        const mobile =
            document
                .getElementById("mobile")
                .value
                .trim();


        // ----------------------------------
        // Basic validation
        // ----------------------------------

        if (
            !branch ||
            !rollNo ||
            !mobile
        ) {

            showMessage(
                "Please fill all fields.",
                "error"
            );

            return;
        }


        if (
            !/^[6-9]\d{9}$/.test(
                mobile
            )
        ) {

            showMessage(
                "Please enter a valid 10-digit mobile number.",
                "error"
            );

            return;
        }


        // ----------------------------------
        // Loading
        // ----------------------------------

        findPassBtn.disabled = true;

        findPassBtn.textContent =
            "Finding your pass...";


        showMessage(
            "Searching your registration..."
        );


        try {

            // ----------------------------------
            // Search student
            // ----------------------------------

            const {
                data,
                error
            } = await db
                .from("students")
                .select("*")
                .eq(
                    "branch",
                    branch
                )
                .eq(
                    "roll_no",
                    rollNo
                )
                .eq(
                    "mobile",
                    mobile
                )
                .maybeSingle();


            // ----------------------------------
            // Database error
            // ----------------------------------

            if (error) {

                console.error(
                    "Recovery error:",
                    error
                );

                showMessage(
                    "Unable to find your pass. Please try again.",
                    "error"
                );

                return;
            }


            // ----------------------------------
            // Student not found
            // ----------------------------------

            if (!data) {

                showMessage(
                    "No registration found with these details.",
                    "error"
                );

                return;
            }


            // ----------------------------------
            // Create current student object
            // ----------------------------------

            const currentStudent = {

                id:
                    data.id,

                name:
                    data.name,

                rollNo:
                    data.roll_no,

                branch:
                    data.branch,

                year:
                    data.year,

                mobile:
                    data.mobile,

                passId:
                    data.pass_id,

                paymentStatus:
                    data.payment_status,

                entryStatus:
                    data.entry_status,

                registeredAt:
                    data.created_at,

                entryTime:
                    data.entry_time

            };


            // ----------------------------------
            // Save pass locally
            // ----------------------------------

            localStorage.setItem(

                CURRENT_PASS_KEY,

                JSON.stringify(
                    currentStudent
                )

            );


            // ----------------------------------
            // Success
            // ----------------------------------

            showMessage(
                "Pass found! Opening your pass..."
            );


            // ----------------------------------
            // Open pass
            // ----------------------------------

            setTimeout(
                function () {

                    window.location.href =
                        "pass.html";

                },
                700
            );

        }

        catch (error) {

            console.error(
                "Unexpected recovery error:",
                error
            );

            showMessage(
                "Something went wrong. Please try again.",
                "error"
            );

        }

        finally {

            findPassBtn.disabled =
                false;

            findPassBtn.textContent =
                "🔎 Find My Pass";

        }

    }
);