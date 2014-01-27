package org.delta.core.sql.provider;

import org.delta.core.exception.BusinessException;
import org.delta.core.utils.ValueMap;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.dom4j.Document;
import org.dom4j.DocumentException;
import org.dom4j.Element;
import org.dom4j.io.SAXReader;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import java.io.File;
import java.net.URI;
import java.net.URL;
import java.util.*;


/**
 * version: 1.0
 * commonts: ......
 */
@Repository
public class XmlSqlProvider {
    private static Logger logger = Logger.getLogger(XmlSqlProvider.class);

    private static Map<String, String> xmlSqlMap = new HashMap<String, String>();
    private static List<ValueMap> sqlTitleList = new ArrayList<ValueMap>();

    public final static String DEFAULT_SQL_FILE_PATH = "/sql";

    @PostConstruct
    public void load() {
        List<File> files = null;
        try {
            URL url = XmlSqlProvider.class.getResource(DEFAULT_SQL_FILE_PATH);
            if (url != null) {
                URI uri = url.toURI();
                String path = new File(uri).getPath();
                files = getSqlFiles(path);
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        if (CollectionUtils.isEmpty(files)) {
            return;
        }

        try {
            for (File file : files) {
                loadFile(file);
            }
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);
        }

    }

    private void loadFile(File file) throws DocumentException, BusinessException {
        if (logger.isInfoEnabled()) {
            logger.info("load org.delta.system.service.sql...");
        }
        SAXReader reader = new SAXReader();
        Document doc = reader.read(file);
        Element root = doc.getRootElement();
        String namespace = root.attributeValue("namespace");
        if (StringUtils.isBlank(namespace)) {
            throw new BusinessException("no namespace in " + file.getName());
        }
        Element foo;
        for (Iterator i = root.elementIterator("sql"); i.hasNext(); ) {
            foo = (Element) i.next();
            String name = foo.attributeValue("name");
            String title = foo.attributeValue("title");
            String text = foo.getText();

            if (StringUtils.isBlank(name) ||
                    StringUtils.isBlank(title) ||
                    StringUtils.isBlank(text)) {
                throw new BusinessException("resolver org.delta.system.service.sql xml failed in " + file.getName());
            }

            String[] names = new String[]{name};
            String[] titles = new String[]{title};
            if (name.indexOf(",") > 0) {
                names = name.split(",");
                titles = title.split(",");
            }
            if (titles.length != names.length) {
                throw new BusinessException("name match title failed in " + file.getName());
            }

            for (int j = 0; j < names.length; j++) {
                String key = namespace + "." + StringUtils.trim(names[j]);
                xmlSqlMap.put(key, text);
                ValueMap map = new ValueMap();
                map.put("key", key);
                map.put("title", StringUtils.trim(titles[j]));
                sqlTitleList.add(map);
//				if (logger.isDebugEnabled()) {
//					logger.debug("\ntitle:" + StringUtils.trim(titles[j]) + "; sqlKey:" + key + "; org.delta.system.service.sql: " + text);
//				}
            }
        }

        if (logger.isInfoEnabled()) {
            logger.info("load org.delta.system.service.sql finished, total count is " + xmlSqlMap.size());
        }
    }

    private List<File> getSqlFiles(String path) {
        List<File> list = new ArrayList<File>();
        File file = new File(path);
        if (!file.exists()) {
            return null;
        }
        File[] files = file.listFiles();
        for (int i = 0; i < files.length; i++) {
            File f = files[i];
            if (f.isDirectory()) {
                List<File> clist = getSqlFiles(f.getPath());
                list.addAll(clist);
            }
            if (f.isFile() && f.getName().endsWith(".xml")) {
                list.add(f);
            }
        }

        return list;
    }

    public String getSql(String key) throws BusinessException {
        load();
        String sql = xmlSqlMap.get(key);
        if (sql == null) {
            throw new BusinessException("can't found org.delta.system.service.sql by " + key);
        }
        return sql;
    }

    public String getSqlKey(String namespace, String sqlName) {
        return namespace + "." + sqlName;
    }

    public static List<ValueMap> listSqlTitle() {
        return sqlTitleList;
    }

    public static void main(String[] args) {
        XmlSqlProvider provider = new XmlSqlProvider();
        provider.load();

        Iterator<String> it = xmlSqlMap.keySet().iterator();
    }
}

