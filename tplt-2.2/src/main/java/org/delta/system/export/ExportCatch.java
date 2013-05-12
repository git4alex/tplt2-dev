package org.delta.system.export;

import org.delta.core.utils.ValueMap;

/**
 * date: 2011-11-10
 *
 * version: 1.0
 * commonts: ......
 */
public class ExportCatch {
	private static ValueMap map = new ValueMap();

	public static void put(String key, Object value) {
		map.put(key, value);
	}

	public static Object getAndRemove(String key) {
		return map.get(key);
	}
}


