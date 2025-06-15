
import React from "react";

const FallbackInstructions: React.FC = () => (
  <div className="space-y-3">
    <ol className="list-decimal list-inside space-y-2">
      <li>
        <b>Primary Reset:</b> Click “Exit Impersonation” in the admin control bar.
      </li>
      <li>
        <b>Emergency Reset:</b> Use <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd> keyboard shortcut anywhere.
      </li>
      <li>
        <b>URL Reset:</b> Add <code>?admin=reset</code> to the URL and press enter.
      </li>
      <li>
        <b>Session Reset:</b> Clear browser cache and cookies.
      </li>
      <li>
        <b>Complete Reset:</b> Log out and log back in to fully exit impersonation mode.
      </li>
    </ol>
    <p>
      <b>Note:</b> These methods will restore your admin access if you become stuck during “view as user.”
    </p>
  </div>
);

export default FallbackInstructions;
