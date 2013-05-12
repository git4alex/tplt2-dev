package org.delta.system.controller;

import org.delta.core.exception.BusinessException;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.delta.core.utils.UploadFileUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

@Controller
public class UploadController {
    private Logger logger = Logger.getLogger(UploadController.class);

    @RequestMapping("/upload")
    public void processImageUpload(@RequestParam() MultipartFile file, HttpServletRequest request, HttpServletResponse response) {
        String appRootPath = request.getSession().getServletContext().getRealPath("/");
        final StringBuilder fullPath = new StringBuilder(appRootPath + UploadFileUtils.UploadFileFolder.UPLOAD_FOLDER);
        final StringBuilder fileName = new StringBuilder();

        SimpleDateFormat dateformat = new SimpleDateFormat("yyyyMMdd");
        String dateStr = dateformat.format(new Date());
        fullPath.append("/").append(dateStr);
        fileName.append(dateStr).append("-");
        File dir = new File(fullPath.toString());
        if (!(dir.exists())) {
            dir.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        int index = originalFilename.lastIndexOf(".");
        String expandedName = StringUtils.EMPTY;
        if (index >= 0) {
            expandedName = originalFilename.substring(index);
        }
        expandedName = expandedName.toLowerCase();
        String uuid = UUID.randomUUID().toString().replace("-", "");
        fileName.append(uuid).append(expandedName);

        try {
            byte[] bytes = file.getBytes();
            FileOutputStream fos = new FileOutputStream(dir + "/" + fileName.toString());
            fos.write(bytes); // 写入文件
        } catch (IOException e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);
            throw new BusinessException("文件上传失败");
        }
        String fileId = fileName.toString().replace(".", "|");

        logger.debug("fileId: " + fileId); // 打印文件大小和文件名称
        logger.debug("name: " + fileName); // 打印文件大小和文件名称
        logger.debug("size: " + file.getSize()); // 打印文件大小和文件名称

        StringBuilder sb = new StringBuilder();
        sb.append("{success:true,fileId:'" + fileId + "'}");
        try {
            response.setContentType("text/html");
            response.getWriter().write(sb.toString());
        } catch (IOException e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);
        }
    }
}