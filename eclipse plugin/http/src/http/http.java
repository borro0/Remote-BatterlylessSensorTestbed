package http;

import java.io.IOException;

import org.apache.http.client.fluent.*;

public class http {
	
	public static void main(String[] args) {
		// Do HTTP Post
		try {
			String response = Request.Post("http://localhost:8080/plugin-fileupload")
			.execute()
			.returnContent()
			.asString();
			
			System.out.println("HTTP Post requested");
			System.out.println(response);
			
			
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}

}
