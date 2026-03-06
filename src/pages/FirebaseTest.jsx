import { useState, useEffect } from "react";
import { db, auth, app } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

export default function FirebaseTest() {
    const [status, setStatus] = useState("⏳ Testing Firebase connection...");
    const [details, setDetails] = useState([]);

    useEffect(() => {
        testConnection();
    }, []);

    const testConnection = async () => {
        const results = [];

        // Test 1: Firebase App Initialization
        try {
            if (app) {
                results.push({ test: "Firebase App Init", status: "✅ Connected", detail: `Project: ${app.options.projectId}` });
            }
        } catch (err) {
            results.push({ test: "Firebase App Init", status: "❌ Failed", detail: err.message });
        }

        // Test 2: Auth Service
        try {
            if (auth) {
                results.push({ test: "Auth Service", status: "✅ Available", detail: `Auth domain: ${app.options.authDomain}` });
            }
        } catch (err) {
            results.push({ test: "Auth Service", status: "❌ Failed", detail: err.message });
        }

        // Test 3: Firestore Read/Write
        try {
            // Write a test document
            const testRef = await addDoc(collection(db, "_connection_test"), {
                test: true,
                timestamp: new Date().toISOString(),
            });
            results.push({ test: "Firestore Write", status: "✅ Success", detail: `Doc ID: ${testRef.id}` });

            // Read it back
            const snapshot = await getDocs(collection(db, "_connection_test"));
            results.push({ test: "Firestore Read", status: "✅ Success", detail: `${snapshot.size} doc(s) found` });

            // Clean up test document
            await deleteDoc(doc(db, "_connection_test", testRef.id));
            results.push({ test: "Firestore Delete", status: "✅ Cleanup done", detail: "Test doc removed" });

        } catch (err) {
            results.push({ test: "Firestore Read/Write", status: "❌ Failed", detail: err.message });
        }

        setDetails(results);
        const allPassed = results.every((r) => r.status.startsWith("✅"));
        setStatus(allPassed ? "✅ All Firebase services connected!" : "⚠️ Some tests failed");
    };

    return (
        <div style={{ padding: "40px", maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif" }}>
            <h1 style={{ fontSize: 24, marginBottom: 8 }}>Firebase Connection Test</h1>
            <p style={{ fontSize: 20, marginBottom: 24 }}>{status}</p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                        <th style={{ padding: 8 }}>Test</th>
                        <th style={{ padding: 8 }}>Status</th>
                        <th style={{ padding: 8 }}>Detail</th>
                    </tr>
                </thead>
                <tbody>
                    {details.map((d, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                            <td style={{ padding: 8 }}>{d.test}</td>
                            <td style={{ padding: 8 }}>{d.status}</td>
                            <td style={{ padding: 8, fontSize: 13, color: "#666" }}>{d.detail}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
