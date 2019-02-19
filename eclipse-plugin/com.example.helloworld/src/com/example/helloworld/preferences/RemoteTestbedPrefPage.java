package com.example.helloworld.preferences;

import org.eclipse.core.runtime.preferences.InstanceScope;
import org.eclipse.jface.preference.FieldEditorPreferencePage;
import org.eclipse.jface.preference.FileFieldEditor;
import org.eclipse.jface.preference.StringFieldEditor;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPreferencePage;
import org.eclipse.ui.preferences.ScopedPreferenceStore;

public class RemoteTestbedPrefPage extends FieldEditorPreferencePage implements IWorkbenchPreferencePage {

    public RemoteTestbedPrefPage() {
        super(GRID);
    }

    public void createFieldEditors() {
        addField(new FileFieldEditor("binaryPath", "Binary file:", getFieldEditorParent()));
        addField(new StringFieldEditor("email", "Email address:", getFieldEditorParent()));
        addField(new StringFieldEditor("password", "password:", getFieldEditorParent()));
    }

    @Override
    public void init(IWorkbench workbench) {
        // second parameter is typically the plug-in id
        setPreferenceStore(new ScopedPreferenceStore(InstanceScope.INSTANCE, "com.example.helloworld.preferences"));
        setDescription("Preferences for uploading binary to testbed");
    }

}