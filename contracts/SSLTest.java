import javax.net.ssl.HttpsURLConnection;
import java.net.URL;

public class SSLTest {
    public static void main(String[] args) throws Exception {
        // URL to trigger the SSL handshake
        URL url = new URL("https://www.google.com");
        HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
        connection.connect();
        System.out.println("Connected to: " + url);
    }
}
