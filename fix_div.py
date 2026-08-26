import re

with open("src/pages/AdmissionsManagement.tsx", "r") as f:
    content = f.read()

# I want to fix the `</div>` that was added wrongly.
# The only `</div>` before `)}` that should exist is the one in `activeTab === "exams"`.
# For "offers", "applicants", "verification", it shouldn't be there.
# But wait, did I even need `</div>` for "exams"? Yes, because I added `<div className="space-y-6">` right after `{activeTab === "exams" && (`.

# Let's just fix it manually by removing ALL `        </div>\n      )}` that follow `        </Card>` and replacing with `      )}`
# And then explicitly putting `</div>` ONLY for exams.

# Let's find all occurrences of:
#         </Card>
#         </div>
#       )}
# and replace with:
#         </Card>
#       )}

content = content.replace("        </Card>\n        </div>\n      )}", "        </Card>\n      )}")

# Now we need to put it back for exams:
# Find:
#                       <td className="p-3 text-right">
#                         <Button 
#                           onClick={() => handleIssueOffer(app)}
#                           disabled={app.examScore < admissionSettings.passCutoff}
#                           size="sm"
#                           className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold disabled:opacity-40"
#                         >
#                           Generate Offer
#                         </Button>
#                       </td>
#                     </tr>
#                   ))}
#                 </tbody>
#               </table>
#             </div>
#           </CardContent>
#         </Card>
#       )}
# And replace `</Card>\n      )}` with `</Card>\n        </div>\n      )}` in that specific block.

block = """                      <td className="p-3 text-right">
                        <Button 
                          onClick={() => handleIssueOffer(app)}
                          disabled={app.examScore < admissionSettings.passCutoff}
                          size="sm"
                          className="h-8 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold disabled:opacity-40"
                        >
                          Generate Offer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}"""

new_block = block.replace("        </Card>\n      )}", "        </Card>\n        </div>\n      )}")

content = content.replace(block, new_block)

with open("src/pages/AdmissionsManagement.tsx", "w") as f:
    f.write(content)
