package com.kgm.group.lugtrac.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public void deleteMediaFromUrl(String url) {
        if (url == null || url.isEmpty()) return;

        try {
            // Extract the public_id from the Cloudinary URL
            String[] parts = url.split("/");
            String fileWithExtension = parts[parts.length - 1];
            String publicId = fileWithExtension.substring(0, fileWithExtension.lastIndexOf('.'));

            // Determine if it is a video or an image
            String resourceType = url.contains("/video/upload/") ? "video" : "image";

            // Call Cloudinary API to permanently delete the file
            Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", resourceType));
            System.out.println("Cloudinary deletion result for " + publicId + ": " + result.get("result"));

        } catch (Exception e) {
            System.err.println("Failed to delete media from Cloudinary: " + e.getMessage());
        }
    }
}