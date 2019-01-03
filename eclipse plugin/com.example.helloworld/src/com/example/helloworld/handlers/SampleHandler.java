package com.example.helloworld.handlers;

import org.eclipse.core.commands.AbstractHandler;
import org.eclipse.core.commands.ExecutionEvent;
import org.eclipse.core.commands.ExecutionException;
import org.eclipse.core.runtime.Platform;
import org.eclipse.ui.IWorkbenchPage;
import org.eclipse.ui.IWorkbenchWindow;
import org.eclipse.ui.PartInitException;
import org.eclipse.ui.handlers.HandlerUtil;
import org.eclipse.ui.console.*;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import org.apache.commons.validator.routines.EmailValidator;
import org.apache.http.HttpEntity;
import org.apache.http.client.fluent.*;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;

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
		
		// Retrieve settings
		String email = Platform.getPreferencesService().
			    getString("com.example.helloworld.preferences", "email", "", null);
		String password = Platform.getPreferencesService().
			    getString("com.example.helloworld.preferences", "password", "", null);
		String binaryPath = Platform.getPreferencesService().
			    getString("com.example.helloworld.preferences", "binaryPath", "", null);
		
		if (CheckSettings(email, password, binaryPath, out))
		{
			out.println("Canceling upload");
			return null;
		}
		
		doHttpPost(out, email, password, binaryPath);

		return null;
	}

	private void doHttpPost(MessageConsoleStream out, String email, String password, String binaryPath) {
		// Do HTTP Post
		try {
			
			MultipartEntityBuilder builder = MultipartEntityBuilder.create();
			builder.addTextBody("email", email, ContentType.TEXT_PLAIN);
			builder.addTextBody("password", password, ContentType.TEXT_PLAIN);

			// This attaches the file to the POST:
			File f = new File(binaryPath);
			builder.addBinaryBody(
			    "file",
			    new FileInputStream(f),
			    ContentType.APPLICATION_OCTET_STREAM,
			    f.getName()
			);

			HttpEntity multipart = builder.build();
			
			String response = Request.Post("http://localhost:8080/plugin-fileupload")
			        .connectTimeout(2000)
			        .socketTimeout(2000)
			        .body(multipart)
			        .execute().returnContent().asString();
			
			out.println("HTTP Post requested");
			out.println(response);
			
		} catch (IOException e1) {
			out.println("Could not connect with the server!");
			e1.printStackTrace();
		}
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
	
	private boolean CheckSettings(String email, String password, String binaryPath, MessageConsoleStream out)
	{
		boolean returnValue = false;
		
		//if(email == "")
		if(!(EmailValidator.getInstance().isValid(email)))
		{
			out.println("Email is not set!");
			returnValue = true;
		}
		
		if(password == "")
		{
			out.println("Password is not set!");
			returnValue = true;
		}
		
		if(binaryPath == "")
		{
			out.println("Path to binary is not set!");
			returnValue = true;
		}
		
		return returnValue;
	}
}
