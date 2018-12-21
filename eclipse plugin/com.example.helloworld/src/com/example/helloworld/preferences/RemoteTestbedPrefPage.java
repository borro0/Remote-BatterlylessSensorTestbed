package com.example.helloworld.preferences;

import org.eclipse.core.runtime.preferences.InstanceScope;
import org.eclipse.jface.preference.DirectoryFieldEditor;
import org.eclipse.jface.preference.FieldEditorPreferencePage;
import org.eclipse.jface.preference.StringFieldEditor;
import org.eclipse.ui.IWorkbench;
import org.eclipse.ui.IWorkbenchPreferencePage;
import org.eclipse.ui.preferences.ScopedPreferenceStore;

public class RemoteTestbedPrefPage extends FieldEditorPreferencePage implements IWorkbenchPreferencePage {

    public RemoteTestbedPrefPage() {
        super(GRID);
    }

    public void createFieldEditors() {
        addField(new DirectoryFieldEditor("binaryPath", "&Directory preference:", getFieldEditorParent()));
        addField(new StringFieldEditor("email", "A &text preference:", getFieldEditorParent()));
        addField(new StringFieldEditor("password", "A t&ext preference:", getFieldEditorParent()));
    }

    @Override
    public void init(IWorkbench workbench) {
        // second parameter is typically the plug-in id
        setPreferenceStore(new ScopedPreferenceStore(InstanceScope.INSTANCE, "com.example.helloworld.preferences"));
        setDescription("Preferences for uploading binary to testbed");
    }

}