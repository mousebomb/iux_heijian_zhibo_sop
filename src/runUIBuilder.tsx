import {bitable, UIBuilder} from "@base-open/web-api";
import Config from "./config";
import BitableHelper from "./bitableHelper";

export default async function main(uiBuilder: UIBuilder) {
    //先验证表格名称是否都存在
    const tableMetaList = await bitable.base.getTableMetaList();
    console.log("default/main 刷新运行");
    let hasTablePaiQi = false;
    let hasTableSOP = false;
    let hasTableRWQD = false;

    tableMetaList.forEach((li) => {
        if (li.name == Config.TAB_NAME_PAIQI) {
            hasTablePaiQi = true;
        } else if (li.name == Config.TAB_NAME_SOP) {
            hasTableSOP = true;
        } else if (li.name == Config.TAB_NAME_RWQD) {
            hasTableRWQD = true;
        }
    });
    if (!hasTablePaiQi) {
        return uiBuilder.markdown(`检测不到\`${Config.TAB_NAME_PAIQI}\`表`);
    }
    if (!hasTableSOP) {
        return uiBuilder.markdown(`检测不到\`${Config.TAB_NAME_SOP}\`表`);
    }
    if (!hasTableRWQD) {
        return uiBuilder.markdown(`检测不到\`${Config.TAB_NAME_RWQD}\`表`);
    }
    // 截止此处，表格名称都存在
    const paiqiTable = await bitable.base.getTableByName(Config.TAB_NAME_PAIQI);
    const sopTable = await bitable.base.getTableByName(Config.TAB_NAME_SOP);
    const rwqdTable = await bitable.base.getTableByName(Config.TAB_NAME_RWQD);
    //验证字段
    // 验证字段.排期表
    const paiqiFieldMetaList = await paiqiTable.getFieldMetaList();
    const paiqiPaiQiGaiShuField = paiqiFieldMetaList.find((li) => li.name == Config.FIELD_PAIQI_PaiQiGaiShu);
    if ( !paiqiPaiQiGaiShuField )
    {
        return uiBuilder.markdown(`检测不到\`${Config.FIELD_PAIQI_PaiQiGaiShu}\`字段`);
    }
    const paiqiZhiBoRenWuQingDanField = paiqiFieldMetaList.find((li) => li.name == Config.FIELD_PAIQI_ZhiBoRenWuQingDan);
    if ( !paiqiZhiBoRenWuQingDanField )
    {
        return uiBuilder.markdown(`检测不到\`${Config.FIELD_PAIQI_ZhiBoRenWuQingDan}\`字段`);
    }
    // 验证字段.SOP表
    const sopFieldMetaList = await sopTable.getFieldMetaList();
    const sopRenWuXiangQingField = sopFieldMetaList.find((li) => li.name == Config.FIELD_SOP_RenWuXiangQing);
    if ( !sopRenWuXiangQingField )
    {
        return uiBuilder.markdown(`检测不到\`${Config.FIELD_SOP_RenWuXiangQing}\`字段`);
    }
    const sopFuZeRenField = sopFieldMetaList.find((li) => li.name == Config.FIELD_SOP_FuZeRen);
    if ( !sopFuZeRenField )
    {
        return uiBuilder.markdown(`检测不到\`${Config.FIELD_SOP_FuZeRen}\`字段`);
    }
    const sopCanKaoWenDangLianJieField = sopFieldMetaList.find((li) => li.name == Config.FIELD_SOP_CanKaoWenDangLianJie);
    if ( !sopCanKaoWenDangLianJieField )
    {
        return uiBuilder.markdown(`检测不到\`${Config.FIELD_SOP_CanKaoWenDangLianJie}\`字段`);
    }
    // 验证字段.任务清单表
    const rwqdFieldMetaList = await rwqdTable.getFieldMetaList();
    const rwqdRenWuXiangQingField = rwqdFieldMetaList.find((li) => li.name == Config.FIELD_RWQD_RenWuXiangQing);
    if ( !rwqdRenWuXiangQingField )
    {
        return uiBuilder.markdown(`检测不到\`${Config.FIELD_RWQD_RenWuXiangQing}\`字段`);
    }
    const rwqdFuZeRenField = rwqdFieldMetaList.find((li) => li.name == Config.FIELD_RWQD_FuZeRen);
    if ( !rwqdFuZeRenField )
    {
        return uiBuilder.markdown(`检测不到\`${Config.FIELD_RWQD_FuZeRen}\`字段`);
    }
    const rwqdCanKaoWenDangLianJieField = rwqdFieldMetaList.find((li) => li.name == Config.FIELD_RWQD_CanKaoWenDangLianJie);
    if ( !rwqdCanKaoWenDangLianJieField )
    {
        return uiBuilder.markdown(`检测不到\`${Config.FIELD_RWQD_CanKaoWenDangLianJie}\`字段`);
    }
    const rwqdPaiQiGaiShuField = rwqdFieldMetaList.find((li) => li.name == Config.FIELD_RWQD_PaiQiGaiShu);
    if ( !rwqdPaiQiGaiShuField )
    {
        return uiBuilder.markdown(`检测不到\`${Config.FIELD_RWQD_PaiQiGaiShu}\`字段`);
    }



    //输出表单
    // let t = new Date();
    // let tS = t.toString();
    uiBuilder.markdown(`
  **一键分配直播任务**
  `);


    const selection = await bitable.base.getSelection();
    // console.log("getSelection", selection);
    // uiBuilder.showLoading('Loading...');
    // // 1000 毫秒后隐藏 loading
    // setTimeout(() => {
    //   uiBuilder.hideLoading();
    // }, 1000);

    //确保选中了行
    if (!selection.recordId) {
        return uiBuilder.text("没有选中任何排期");
    }
    //检测当前选中是否在商机管理表
    if (selection.tableId == null) {
        return uiBuilder.text("没有选中任何表格");
    }
    const selectionTable = await bitable.base.getTableById(selection.tableId);
    const selectionTableName = await selectionTable.getName();
    if (selectionTableName != Config.TAB_NAME_PAIQI) {
        return uiBuilder.text("选中的表格不是排期表");
    }

    //确定要填入的字段值
    //--显示核对数据：
    //排期概述
    const cellStrPaiQiGaiShu = await selectionTable.getCellString(paiqiPaiQiGaiShuField.id, selection.recordId);

    // 查重，确保不要重复写入客户
    const isYiShangBao = await selectionTable.getCellString(paiqiZhiBoRenWuQingDanField.id, selection.recordId);
    if (isYiShangBao) {
        return uiBuilder.markdown(`该直播已有任务清单: 【${cellStrPaiQiGaiShu}】，不可重复分配`);
    }
    //--写入数据：
  // 排期概述:引用= 排期.recordId
  // 任务详情:多行文本 = SOP.任务详情
  // 负责人:用户= SOP.负责人引用转换为值
  // 参考文档链接：链接= SOP.参考文档链接

  // 排期概述:引用= 排期.recordId
    const cellValuePaiQiGaiShu = BitableHelper.createOpenLink(selection.recordId, selection.tableId);


    uiBuilder.markdown(`确认要分配任务：
  - ${cellStrPaiQiGaiShu}`);

    uiBuilder.form((form) => ({
        formItems: [],
        buttons: ['一键分配'],
    }), async ({key, values}) => {
        if (key == "一键分配") {
            //写入数据
            const flushData = async () => {
                //显示加载
                uiBuilder.showLoading('插入中，请不要重复点击，以免造成数据错误...');

                // 遍历sop表，所有SOP行全部需要插入任务清单一次
                const sopRecords = await sopTable.getRecordIdList();
                let done=1;
                for (let sopRecordId of sopRecords) {
                    console.log("default/flushData 写入"+done+"/"+sopRecords.length);
                    //每一条记录插入一次
                    if ( !sopRecordId )
                    {
                        console.warn("default/flushData", "sopRecordId is null");
                        continue;
                    }
                    const curSopRecord = await sopTable.getRecordById(sopRecordId);
                    // 任务详情:多行文本 = SOP.任务详情
                    const cellValueRenWuXiangQing = curSopRecord.fields[sopRenWuXiangQingField.id];
                    // 负责人:用户= SOP.负责人引用转换为值，引用不在record中，需要单独获取
                    const cellValueFuZeRen = await sopTable.getCellValue(sopFuZeRenField.id, sopRecordId);
                    // 参考文档链接：链接= SOP.参考文档链接
                    const cellValueCanKaoWenDangLianJie = curSopRecord.fields[sopCanKaoWenDangLianJieField.id];
                        //
                    uiBuilder.showLoading('插入'+done+"/"+sopRecords.length+'，请不要重复点击，以免造成数据错误...');
                    console.log("default/flushData",cellValueFuZeRen);

                    await rwqdTable.addRecord({
                        fields: {
                            [rwqdRenWuXiangQingField.id]: cellValueRenWuXiangQing,
                            [rwqdFuZeRenField.id]: cellValueFuZeRen,
                            [rwqdCanKaoWenDangLianJieField.id]: cellValueCanKaoWenDangLianJie,
                            [rwqdPaiQiGaiShuField.id]: cellValuePaiQiGaiShu,
                        }
                    });
                    done++;
                }

                uiBuilder.hideLoading();
                uiBuilder.message.success(`已经写入完毕`);

                uiBuilder.clear();
uiBuilder.markdown(`**一键分配任务**
 已执行完毕，请选择其他行，或者关闭窗口`);
            }
            flushData();
        }
    });
}