package com.work.IGA.Controllers.Courses;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.work.IGA.Services.CourseServices.PaymentService;
import com.work.IGA.Utils.PaymentUtils.PaymentResponse;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/payments")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentService paymentService;

    // Manual verification endpoint for testing
    @PostMapping("/verify-payment")
    public ResponseEntity<PaymentResponse> manualVerifyPayment(
        @RequestParam String transactionId,
        @RequestParam String reference,
        @RequestParam(defaultValue = "successful") String status
    ) {
        try {
            PaymentResponse response = paymentService.handlePaymentWebhook(
                transactionId, reference, status);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(PaymentResponse.errorResponse(
                    "Failed to verify payment: " + e.getMessage(),
                    "PAYMENT_VERIFICATION_ERROR"));
        }
    }

    // Handle Flutterwave webhhook notfications

    @PostMapping("/webhook")
    public ResponseEntity<String> handlePaymentWebhook(@RequestBody String webhookData , 
     @RequestHeader(value = "verif-hash", required = false) String verifHash) {
          try {

            String transactionId = "extracted_from_webhook"; // Parse from webhookData
            String reference = "extracted_from_webhook"; // Parse from webhookData  
            String status = "extracted_from_webhook"; // Parse from webhookData
            
            PaymentResponse response = paymentService.handlePaymentWebhook(
                transactionId, reference, status);
            
            return ResponseEntity.ok("Webhook processed successfully");

          }
          catch (Exception e) {
              return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Internal error processing webhook");
          }
    }

    // Payment callback URL - handles redirect after payment
    @GetMapping("/callback")
    public ResponseEntity<String> handlePaymentCallback(
        @RequestParam(required = false) String status, 
        @RequestParam(required = false) String tx_ref,
        @RequestParam(required = false) String transaction_id,
        @RequestParam(required = false) String payment_reference
    ) {
        try {
            // Log the callback parameters for debugging
            System.out.println("Payment Callback - Status: " + status + 
                             ", Transaction ID: " + transaction_id + 
                             ", Reference: " + tx_ref + 
                             ", Payment Reference: " + payment_reference);
            
            // Auto-verify successful payments in the background
            if ("successful".equals(status) && transaction_id != null && 
                (tx_ref != null || payment_reference != null)) {
                try {
                    String reference = tx_ref != null ? tx_ref : payment_reference;
                    paymentService.handlePaymentWebhook(transaction_id, reference, status);
                    System.out.println("Payment auto-verified successfully: " + reference);
                } catch (Exception e) {
                    System.err.println("Error during auto-verification: " + e.getMessage());
                    // Continue with redirect even if verification fails
                }
            }
            
            // Construct redirect URL to frontend callback page
            StringBuilder redirectUrl = new StringBuilder("http://localhost:8080/payment/callback?");
            
            if (payment_reference != null) {
                redirectUrl.append("payment_reference=").append(payment_reference).append("&");
            }
            if (status != null) {
                redirectUrl.append("status=").append(status).append("&");
            }
            if (tx_ref != null) {
                redirectUrl.append("tx_ref=").append(tx_ref).append("&");
            }
            if (transaction_id != null) {
                redirectUrl.append("transaction_id=").append(transaction_id).append("&");
            }
            
            // Remove trailing & if present
            String finalRedirectUrl = redirectUrl.toString();
            if (finalRedirectUrl.endsWith("&")) {
                finalRedirectUrl = finalRedirectUrl.substring(0, finalRedirectUrl.length() - 1);
            }
            
            // Return HTML with immediate redirect to frontend
            return ResponseEntity.ok(
                "<html><head>" +
                "<meta http-equiv='refresh' content='0; url=" + finalRedirectUrl + "'>" +
                "</head><body style='text-align:center; padding:50px; font-family:Arial;'>" +
                "<h2>🔄 Redirecting to payment confirmation...</h2>" +
                "<p>If you are not redirected automatically, <a href='" + finalRedirectUrl + "'>click here</a>.</p>" +
                "<script>" +
                "setTimeout(() => window.location.href = '" + finalRedirectUrl + "', 1000);" +
                "</script>" +
                "</body></html>"
            );
            
        } catch (Exception e) {
            System.err.println("Error processing payment callback: " + e.getMessage());
            
            // Fallback redirect to frontend with error
            String errorRedirectUrl = "http://localhost:8080/payment/callback?status=error&error=" + 
                                    java.net.URLEncoder.encode(e.getMessage(), java.nio.charset.StandardCharsets.UTF_8);
            
            return ResponseEntity.ok(
                "<html><head>" +
                "<meta http-equiv='refresh' content='0; url=" + errorRedirectUrl + "'>" +
                "</head><body style='text-align:center; padding:50px; font-family:Arial;'>" +
                "<h2>🔄 Redirecting to payment confirmation...</h2>" +
                "<p>If you are not redirected automatically, <a href='" + errorRedirectUrl + "'>click here</a>.</p>" +
                "</body></html>"
            );
        }
    }
}
