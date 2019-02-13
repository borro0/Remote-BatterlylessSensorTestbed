package http;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import org.apache.http.HttpEntity;
import org.apache.http.client.fluent.*;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.mime.MultipartEntityBuilder;

public class http {
	
	public static void main(String[] args) {
		// Do HTTP Post
		try {
			
			String binaryPath = "C:\\Users\\boris\\Documents\\Remote-BatterlylessSensorTestbed\\authDemo\\python\\OutOfBox_MSP430FR5969.txt";
			MultipartEntityBuilder builder = MultipartEntityBuilder.create();
			builder.addTextBody("email", "borisblokland@gmail.com", ContentType.TEXT_PLAIN);
			builder.addTextBody("password", "123", ContentType.TEXT_PLAIN);

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
			
			System.out.println("HTTP Post requested");
			System.out.println(response);
			
		} catch (IOException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
	}

}
