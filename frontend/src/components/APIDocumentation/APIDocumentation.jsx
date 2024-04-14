import React from 'react';
import { useNavigate } from "react-router-dom";
import './APIDocumentation.css';
import Header from '../Header/Header';

const APIDocumentation = () => {

    const navigate = useNavigate();

    const toggleReturn = () => {
        navigate("/");
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex-grow flex justify-left items-left flex-col m-20">
                <div className="text-left">
                <button className="hover:scale-105 transition-all duration-300 text-xs py-2 px-4 rounded mt-10 mb-7 " onClick={toggleReturn}>
                        Return
                    </button>
                    <div className="text-xl font-poppins">
                        API Docs <br />
                    </div>

                    <div ng-bind-html="trustedHtml" class="ng-binding"><h3>1. POST /upload - Upload Spreadsheet and Create Session</h3>
<h4>Purpose</h4>
<p>Accepts an Excel file containing items data, processes it, and creates a new session in the database with items categorized as 'uncompleted_items'.</p>
<h4>Request</h4>
<ul>
<li><p><strong>Method</strong>: POST</p></li>
<li><p><strong>Endpoint</strong>: <code>/upload</code></p></li>
<li><p><strong>Body</strong>: Form-data with key <code>excelFile</code> containing the Excel file to be uploaded.</p></li>
<li><p><strong>Content-Type</strong>: multipart/form-data</p></li>
</ul>
<h4>Response</h4>
<ul>
<li><p><strong>Content-Type</strong>: application/json</p></li>
<li><p><strong>Body</strong>:</p></li>
</ul>
<pre><code class="json language-json">&#123;
"_id": "&lt;SessionID&gt;",
"uncompleted_items": ["&lt;ItemID1&gt;", "&lt;ItemID2&gt;", "..."]
&#125;</code></pre>
<h3>2. GET /itemVendibility - Calculate Item Vendibility</h3>
<h4>Purpose</h4>
<p>Accepts a <code>sessionId</code> and an <code>itemId</code>, checks if the item exists in the given session, and returns vendibility information for the item.</p>
<h4>Request</h4>
<ul>
<li><p><strong>Method</strong>: GET</p></li>
<li><p><strong>Endpoint</strong>: <code>/itemVendibility</code></p></li>
<li><p><strong>Query Parameters</strong>:</p></li>
<li><p><code>sessionId</code>: The ID of the session to search within.</p></li>
<li><p><code>itemId</code>: The ID of the item to analyze for vendibility.</p></li>
</ul>
<h4>Response</h4>
<ul>
<li><p><strong>Content-Type</strong>: application/json</p></li>
<li><p><strong>Body</strong>: JSON object containing vendibility analysis results. The structure of this object depends on the implementation of <code>dataAnalysis()</code> function.</p></li>
</ul>
<h3>3. GET /getSessionIDs - Retrieve Session IDs</h3>
<h4>Purpose</h4>
<p>Retrieves all session IDs from the database along with their completed and uncompleted items.</p>
<h4>Request</h4>
<ul>
<li><p><strong>Method</strong>: GET</p></li>
<li><p><strong>Endpoint</strong>: <code>/getSessionIDs</code></p></li>
</ul>
<h4>Response</h4>
<ul>
<li><p><strong>Content-Type</strong>: application/json</p></li>
<li><p><strong>Body</strong>:</p></li>
</ul>
<pre><code class="json language-json">&#123;
"_ids": ["&lt;SessionID1&gt;", "&lt;SessionID2&gt;", "..."],
"completedItems": [[], [], "..."],
"uncompletedItems": [[], [], "..."]
&#125;</code></pre>
<h3>Error Handling</h3>
<p>All endpoints respond with appropriate HTTP status codes and error messages in case of failures. Common responses include:</p>
<ul>
<li><p><strong>Status 500 (Internal Server Error)</strong>: When an unexpected condition was encountered.</p></li>
<li><p><strong>Status 400 (Bad Request)</strong>: When the request cannot be processed due to client-side errors (e.g., missing or invalid parameters).</p></li>
</ul>
<h3>4. GET /getItem - Retrieve Item Data</h3>
<h4>Purpose</h4>
<p>Fetches item data if it exists within a specified session.</p>
<h4>Request</h4>
<ul>
<li><p><strong>Method</strong>: GET</p></li>
<li><p><strong>Endpoint</strong>: <code>/getItem</code></p></li>
<li><p><strong>Query Parameters</strong>:</p></li>
<li><p><code>sessionId</code>: The ID of the session.</p></li>
<li><p><code>itemId</code>: The ID of the item.</p></li>
</ul>
<h4>Response</h4>
<ul>
<li><p><strong>Content-Type</strong>: application/json</p></li>
<li><p><strong>Body</strong>: JSON object containing the item's data if found, otherwise an error message.</p></li>
</ul>
<h3>5. POST /createSession - Create New Session</h3>
<h4>Purpose</h4>
<p>Creates a new session in the database and returns its ID.</p>
<h4>Request</h4>
<ul>
<li><p><strong>Method</strong>: POST</p></li>
<li><p><strong>Endpoint</strong>: <code>/createSession</code></p></li>
</ul>
<h4>Response</h4>
<ul>
<li><p><strong>Content-Type</strong>: application/json</p></li>
<li><p><strong>Body</strong>:</p></li>
</ul>
<pre><code class="json language-json">&#123;
"sessionId": "&lt;NewSessionID&gt;"
&#125;</code></pre>
<h3>6. POST /addItem - Add Item to Session</h3>
<h4>Purpose</h4>
<p>Adds a new item to a specified session. The item data must be provided in JSON format.</p>
<h4>Request</h4>
<ul>
<li><p><strong>Method</strong>: POST</p></li>
<li><p><strong>Endpoint</strong>: <code>/addItem</code></p></li>
<li><p><strong>Body</strong>: JSON object containing the item's data and the session ID it should be added to.</p></li>
</ul>
<h4>Response</h4>
<ul>
<li><p><strong>Content-Type</strong>: application/json</p></li>
<li><p><strong>Body</strong>:</p></li>
- 
</ul>
<pre><code class="json language-json">&#123;
"success": true
&#125;</code></pre>
<h4>Notes</h4>
<ul>
<li>The JSON body for adding an item should match the specified format, with optional fields as necessary.</li>
</ul>
<h3>7. GET /getTableFromSessionID - Get Table Data From Session ID</h3>
<h4>Purpose</h4>
<p>Returns table data for a specified session ID, including both completed and uncompleted items.</p>
<h4>Request</h4>
<ul>
<li><p><strong>Method</strong>: GET</p></li>
<li><p><strong>Endpoint</strong>: <code>/getTableFromSessionID</code></p></li>
<li><p><strong>Query Parameters</strong>:</p></li>
<li><p><code>sessionID</code>: The ID of the session for which to retrieve table data.</p></li>
</ul>
<h4>Response</h4>
<ul>
<li><p><strong>Content-Type</strong>: application/json</p></li>
<li><p><strong>Body</strong>: JSON object containing an array of items associated with the session.</p></li>
</ul>
<h3>Error Handling</h3>
<p>All endpoints include error handling and will respond with appropriate HTTP status codes and messages in case of failures.</p>
<h3>Notes</h3>
<ul>
<li><p>It's important to ensure that the Excel file follows the expected format and contains data starting from the specified rows and columns as assumed by the <code>/upload</code> endpoint logic.</p></li>
<li><p>For the <code>/itemVendibility</code> endpoint, ensure that both <code>sessionId</code> and <code>itemId</code> are provided as query parameters.</p></li>
<li><p>This API assumes that the client is responsible for managing session lifecycle and item vendibility analysis workflow.</p></li>
<li><p>Ensure proper handling and validation of request data to avoid errors.</p></li>
<li><p>For <code>/addItem</code>, ensure the item JSON matches the expected schema as closely as possible to prevent insertion issues.</p></li>
</ul></div>
                </div>
            </div>
        </div>
    );
};

export default APIDocumentation;