package com.example.helloworld.handlers;

import org.eclipse.core.commands.AbstractHandler;
import org.eclipse.core.commands.ExecutionEvent;
import org.eclipse.core.commands.ExecutionException;

import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.IWorkbenchWindow;
import org.eclipse.ui.PartInitException;
import org.eclipse.ui.handlers.HandlerUtil;
import org.eclipse.jface.dialogs.MessageDialog;
import org.eclipse.ui.console.*;

import java.io.IOException;

import org.apache.http.client.fluent.*;

public class SampleHandler extends AbstractHandler {

	@Override
	public Object execute(ExecutionEvent event) throws ExecutionException {
		
		IWorkbenchWindow window = HandlerUtil.getActiveWorkbenchWindowChecked(event);
		
		System.out.println("Sample command is triggered");
		
		// Setting up console
		MessageConsole myConsole = findConsole("BorroConsole");
		MessageConsoleStream out = myConsole.newMessageStream();
		out.println("Hello from Generic console sample action");
		
		// Making console visible
		IWorkbenchPage page = window.getActivePage();
		String id = IConsoleConstants.ID_CONSOLE_VIEW;
		IConsoleView view;
		try {
			view = (IConsoleView) page.showView(id);
			view.display(myConsole);
		} catch (PartInitException e) {
			System.out.println("Could not connect to or create a console");
			e.printStackTrace();
		}
		
		// Do HTTP Post
		try {
			String response = Request.Post("http://localhost:8080/plugin-fileupload")
			.execute()
			.returnContent()
			.asString();
			
			out.println("HTTP Post requested");
			out.println(response);
			
			
		} catch (IOException e1) {
			out.println("Could not connect with the server!");
			e1.printStackTrace();
		}

		return null;
	}
	
	private MessageConsole findConsole(String name) {
	    ConsolePlugin plugin = ConsolePlugin.getDefault();
	    IConsoleManager conMan = plugin.getConsoleManager();
	    IConsole[] existing = conMan.getConsoles();
	    for (int i = 0; i < existing.length; i++)
	       if (name.equals(existing[i].getName()))
	          return (MessageConsole) existing[i];
	    //no console found, so create a new one
	    MessageConsole myConsole = new MessageConsole(name, null);
	    conMan.addConsoles(new IConsole[]{myConsole});
	    return myConsole;
	}
}
