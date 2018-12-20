package com.example.helloworld.view;

import org.eclipse.swt.widgets.*;
import org.eclipse.ui.part.ViewPart;
import org.eclipse.swt.SWT;

public class SampleView extends ViewPart {
	private Label label;
    
	public SampleView() {
		super();
    }
	
	public void setFocus() {
        label.setFocus();
	}
	
	public void createPartControl(Composite parent) {
		label = new Label( parent, SWT.LEFT ); 
		label.setText( "Hello, Eclipse world!" ); 
	}

}